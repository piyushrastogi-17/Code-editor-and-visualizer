import { ExecutionStep, Variable, TraceResult } from "@/types/execution";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ─── Paths ──────────────────────────────────────────────────────
const GPP_PATH = "C:\\MinGW\\bin\\g++.exe";
const GDB_PATH = "C:\\MinGW\\bin\\gdb.exe";

// ─── Check if gdb is available ──────────────────────────────────
export function isGdbAvailable(): boolean {
  try {
    return fs.existsSync(GDB_PATH);
  } catch {
    return false;
  }
}

// ─── GDB Batch Trace (reliable) ─────────────────────────────────
export async function gdbTrace(
  sourcePath: string,
  executablePath: string,
  inputPath: string,
  sourceCode: string
): Promise<TraceResult> {
  const sourceLines = sourceCode.split("\n");
  const tempDir = path.dirname(sourcePath);
  const baseName = path.basename(sourcePath, ".cpp");
  const gdbScriptPath = path.join(tempDir, `${baseName}-gdb.txt`);

  const maxSteps = Math.min(sourceLines.length * 10, 500);

  const gdbScript = [
    "set pagination off",
    "set print pretty off",
    "set confirm off",
    "break main",
    "run",
    ...Array.from({ length: maxSteps }, () => [
      "echo ===STEP_START===\\n",
      "info line",
      "echo ---LOCALS---\\n",
      "info locals",
      "echo ---ARGS---\\n",
      "info args",
      "echo ---FRAME---\\n",
      "frame",
      "echo ===STEP_END===\\n",
      "next",
    ]).flat(),
    "quit",
  ].join("\n");

  fs.writeFileSync(gdbScriptPath, gdbScript);

  try {
    const gdbCommand = `"${GDB_PATH}" --batch --quiet -x "${gdbScriptPath}" "${executablePath}"`;

    let rawOutput: string;
    try {
      rawOutput = execSync(gdbCommand, {
        timeout: 15000,
        maxBuffer: 1024 * 1024 * 5,
        cwd: tempDir,
        stdin: fs.openSync(inputPath, "r"),
        encoding: "utf8",
      });
    } catch (execErr: unknown) {
      const err = execErr as { stdout?: string; stderr?: string };
      rawOutput = err.stdout || "";
      if (!rawOutput) return staticTrace(sourceCode);
    }

    const steps = parseGdbBatchOutput(rawOutput, sourceLines, sourcePath);

    try { if (fs.existsSync(gdbScriptPath)) fs.unlinkSync(gdbScriptPath); } catch { /* */ }

    if (steps.length === 0) return staticTrace(sourceCode);

    return { success: true, steps, totalSteps: steps.length, sourceLines };
  } catch {
    try { if (fs.existsSync(gdbScriptPath)) fs.unlinkSync(gdbScriptPath); } catch { /* */ }
    return staticTrace(sourceCode);
  }
}

// ─── Parse GDB batch output ────────────────────────────────────
function parseGdbBatchOutput(
  raw: string,
  sourceLines: string[],
  sourcePath: string
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  const segments = raw.split("===STEP_START===");
  let stepCount = 0;
  let previousLine: number | null = null;
  let prevVars: Record<string, Variable> = {};
  const fileName = path.basename(sourcePath);

  for (const segment of segments) {
    if (!segment.includes("===STEP_END===")) continue;
    const content = segment.split("===STEP_END===")[0];

    const lineMatch = content.match(/Line\s+(\d+)\s+of\s+/);
    const frameMatch = content.match(/(?:#\d+\s+)?(\w+)\s*\(.*?\)\s*at\s*\S+?:(\d+)/);

    let currentLine = 0;
    let currentFunction = "main";

    if (lineMatch) currentLine = parseInt(lineMatch[1]);
    else if (frameMatch) {
      currentFunction = frameMatch[1];
      currentLine = parseInt(frameMatch[2]);
    }

    if (currentLine <= 0 || currentLine > sourceLines.length) continue;

    const srcLine = sourceLines[currentLine - 1]?.trim() || "";
    if (srcLine === "{" || srcLine === "}" || srcLine.startsWith("#") || srcLine.startsWith("using ")) {
      previousLine = currentLine;
      continue;
    }

    if (frameMatch) currentFunction = frameMatch[1];

    const localsSection = content.split("---LOCALS---")[1]?.split("---ARGS---")[0] || "";
    const argsSection = content.split("---ARGS---")[1]?.split("---FRAME---")[0] || "";

    const locals = parseVariables(localsSection, "local");
    const args = parseVariables(argsSection, "parameter");

    const allVars: Record<string, Variable> = {};
    for (const v of [...args, ...locals]) {
      allVars[v.name] = {
        ...v,
        changed: prevVars[v.name] ? prevVars[v.name].value !== v.value : true,
      };
    }

    steps.push({
      step: stepCount,
      line: currentLine,
      previousLine,
      sourceCode: sourceLines[currentLine - 1] || "",
      function: currentFunction,
      variables: allVars,
      stack: [{ function: currentFunction, file: fileName, line: currentLine, args, locals }],
      output: "",
      cumulativeOutput: "",
      status: "running",
    });

    previousLine = currentLine;
    prevVars = { ...allVars };
    stepCount++;

    if (content.includes("exited normally") || content.includes("exited with code") ||
        content.includes("Program received signal") || content.includes("Cannot access memory")) {
      break;
    }
  }

  if (steps.length > 0) steps[steps.length - 1].status = "completed";
  return steps;
}

function parseVariables(text: string, scope: "local" | "parameter"): Variable[] {
  const vars: Variable[] = [];
  for (const line of text.split("\n")) {
    const match = line.trim().match(/^(\w+)\s*=\s*(.+)$/);
    if (match) {
      vars.push({
        name: match[1],
        type: inferType(match[2].trim()),
        value: match[2].trim(),
        scope,
        changed: false,
      });
    }
  }
  return vars;
}

function inferType(value: string): string {
  if (/^-?\d+$/.test(value)) return "int";
  if (/^-?\d+\.\d+/.test(value)) return "double";
  if (/^'.'$/.test(value)) return "char";
  if (/^".*"$/.test(value)) return "string";
  if (/^\{.*\}$/.test(value)) return "struct/array";
  if (/^0x[0-9a-f]+/i.test(value)) return "pointer";
  if (value === "true" || value === "false") return "bool";
  return "auto";
}

// ─── Static analysis fallback with loop unrolling ───────────────
export function staticTrace(code: string): TraceResult {
  const sourceLines = code.split("\n");
  const steps: ExecutionStep[] = [];
  let stepCount = 0;
  const variables: Record<string, Variable> = {};
  const currentFunction = "main";

  // Build ordered list of executable lines within main()
  interface LineInfo { lineNum: number; text: string; }
  const mainLines: LineInfo[] = [];
  let inMain = false;
  let braceDepth = 0;

  for (let i = 0; i < sourceLines.length; i++) {
    const line = sourceLines[i].trim();
    if (line.match(/int\s+main\s*\(/)) inMain = true;

    if (inMain) {
      if (line.includes("{")) braceDepth += (line.match(/\{/g) || []).length;
      if (line.includes("}")) braceDepth -= (line.match(/\}/g) || []).length;
      if (braceDepth <= 0 && line.includes("}")) { inMain = false; continue; }
    }

    if (!line || line.startsWith("//") || line.startsWith("#") ||
        line === "{" || line === "}" || line.startsWith("using ")) continue;

    if (inMain || line.match(/int\s+main\s*\(/)) {
      mainLines.push({ lineNum: i + 1, text: line });
    }
  }

  // Helper: create an execution step
  function addStep(lineNum: number) {
    const line = sourceLines[lineNum - 1]?.trim() || "";
    if (!line || line === "{" || line === "}") return;

    const prevSnapshot: Record<string, Variable> = {};
    for (const [k, v] of Object.entries(variables)) prevSnapshot[k] = { ...v };

    processLine(line, variables);

    const snapshot: Record<string, Variable> = {};
    for (const [k, v] of Object.entries(variables)) {
      snapshot[k] = { ...v, changed: !prevSnapshot[k] || prevSnapshot[k].value !== v.value };
    }
    for (const k of Object.keys(variables)) variables[k].changed = false;

    steps.push({
      step: stepCount,
      line: lineNum,
      previousLine: stepCount > 0 ? steps[stepCount - 1].line : null,
      sourceCode: sourceLines[lineNum - 1],
      function: currentFunction,
      variables: snapshot,
      stack: [{ function: currentFunction, file: "main.cpp", line: lineNum, args: [], locals: Object.values(snapshot) }],
      output: "",
      cumulativeOutput: "",
      status: "running",
    });
    stepCount++;
  }

  // Execute lines, unrolling for-loops
  let idx = 0;
  while (idx < mainLines.length && stepCount < 200) {
    const { lineNum, text } = mainLines[idx];

    // Detect for-loop: for(int i = 0; i < N; i++)
    const forMatch = text.match(
      /for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+)\s*;\s*(\w+)\s*([<>!=]+)\s*([^;]+)\s*;\s*(\w+)(\+\+|--)\s*\)/
    );

    if (forMatch) {
      const varName = forMatch[1];
      const initVal = parseInt(evaluateSimple(forMatch[2].trim(), variables));
      const condOp = forMatch[4];
      const condLimit = parseInt(evaluateSimple(forMatch[5].trim(), variables));
      const updateOp = forMatch[7];

      // Find loop body
      const bodyStart = idx + 1;
      let bodyEnd = bodyStart;
      let depth = text.includes("{") ? 1 : 0;

      for (let j = bodyStart; j < mainLines.length; j++) {
        const t = mainLines[j].text;
        if (t.includes("{")) depth += (t.match(/\{/g) || []).length;
        if (t.includes("}")) depth -= (t.match(/\}/g) || []).length;
        bodyEnd = j;
        if (depth <= 0) break;
      }

      const bodyLines = mainLines.slice(bodyStart, bodyEnd).filter(
        (l) => l.text !== "}" && l.text !== "{"
      );

      // Initialize loop variable
      variables[varName] = { name: varName, type: "int", value: String(initVal), scope: "local", changed: true };

      // Step for the for-loop header
      addStep(lineNum);

      // Unroll loop iterations
      let loopVal = initVal;
      let safety = 0;

      const check = (val: number): boolean => {
        switch (condOp) {
          case "<": return val < condLimit;
          case "<=": return val <= condLimit;
          case ">": return val > condLimit;
          case ">=": return val >= condLimit;
          case "!=": return val !== condLimit;
          default: return false;
        }
      };

      while (check(loopVal) && safety < 50 && stepCount < 200) {
        variables[varName] = { ...variables[varName], value: String(loopVal), changed: true };

        for (const bodyLine of bodyLines) {
          addStep(bodyLine.lineNum);
        }

        if (updateOp === "++") loopVal++;
        else if (updateOp === "--") loopVal--;

        variables[varName] = { ...variables[varName], value: String(loopVal), changed: true };
        safety++;
      }

      idx = bodyEnd + 1;
      continue;
    }

    // Regular line
    addStep(lineNum);
    idx++;
  }

  if (steps.length > 0) steps[steps.length - 1].status = "completed";

  return { success: true, steps, totalSteps: steps.length, sourceLines };
}

// ─── Process a single line for variable changes ─────────────────
function processLine(line: string, variables: Record<string, Variable>): void {
  const declMatch = line.match(
    /(?:int|float|double|char|string|bool|long|short|auto|unsigned)\s+(\w+)\s*=\s*(.+?)\s*;/
  );
  const assignMatch = line.match(/^(\w+)\s*=\s*(.+?)\s*;/);
  const compoundMatch = line.match(/^(\w+)\s*(\+|-|\*|\/)=\s*(.+?)\s*;/);
  const incMatch = line.match(/(\w+)\+\+|(\w+)--|\+\+(\w+)|--(\w+)/);

  if (declMatch) {
    variables[declMatch[1]] = {
      name: declMatch[1],
      type: inferTypeFromDecl(line),
      value: evaluateSimple(declMatch[2].trim(), variables),
      scope: "local",
      changed: true,
    };
  } else if (compoundMatch) {
    const name = compoundMatch[1];
    if (variables[name]) {
      const old = parseInt(variables[name].value) || 0;
      const operand = parseInt(evaluateSimple(compoundMatch[3], variables)) || 0;
      let newVal = old;
      switch (compoundMatch[2]) {
        case "+": newVal = old + operand; break;
        case "-": newVal = old - operand; break;
        case "*": newVal = old * operand; break;
        case "/": newVal = operand !== 0 ? Math.floor(old / operand) : 0; break;
      }
      variables[name] = { ...variables[name], value: String(newVal), changed: true };
    }
  } else if (incMatch) {
    const name = incMatch[1] || incMatch[2] || incMatch[3] || incMatch[4];
    if (variables[name]) {
      const old = parseInt(variables[name].value) || 0;
      variables[name] = { ...variables[name], value: String(line.includes("++") ? old + 1 : old - 1), changed: true };
    }
  } else if (assignMatch && variables[assignMatch[1]]) {
    variables[assignMatch[1]] = {
      ...variables[assignMatch[1]],
      value: evaluateSimple(assignMatch[2], variables),
      changed: true,
    };
  }
}

function inferTypeFromDecl(line: string): string {
  if (line.includes("int ")) return "int";
  if (line.includes("float ")) return "float";
  if (line.includes("double ")) return "double";
  if (line.includes("char ")) return "char";
  if (line.includes("string ")) return "string";
  if (line.includes("bool ")) return "bool";
  return "auto";
}

function evaluateSimple(expr: string, vars: Record<string, Variable>): string {
  let e = expr.trim();
  for (const [name, v] of Object.entries(vars)) {
    e = e.replace(new RegExp(`\\b${name}\\b`, "g"), v.value);
  }
  try {
    if (/^[\d\s+\-*/().]+$/.test(e)) {
      const result = Function(`"use strict"; return (${e})`)();
      if (typeof result === "number" && isFinite(result)) {
        return String(Number.isInteger(result) ? result : result.toFixed(6));
      }
    }
  } catch { /* */ }
  return e;
}
