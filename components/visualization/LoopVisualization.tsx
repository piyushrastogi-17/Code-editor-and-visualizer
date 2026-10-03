"use client";

import React, { useMemo } from "react";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { RefreshCw } from "lucide-react";

export default function LoopVisualization() {
  const { steps, currentStepIndex, sourceLines } = useVisualizationStore();

  const currentStep = steps[currentStepIndex];

  // Detect loop context by analyzing execution steps
  const loopInfo = useMemo(() => {
    if (!currentStep || steps.length === 0 || sourceLines.length === 0) return null;

    const currentLine = currentStep.line;

    // Search current line and backwards for loop header
    let loopHeaderLine = -1;
    let loopType = "";
    let loopCondition = "";

    // Search range: current line index down to 10 lines before
    const startIdx = Math.min(currentLine - 1, sourceLines.length - 1);
    const endIdx = Math.max(0, currentLine - 15);

    for (let i = startIdx; i >= endIdx; i--) {
      const line = (sourceLines[i] || "").trim();

      // For loop: for(...) or for (...) 
      const forMatch = line.match(/for\s*\(([^)]*(?:\([^)]*\))*[^)]*)\)/);
      if (!forMatch) {
        // Try simpler match
        const simpleFor = line.match(/for\s*\((.+)\)\s*\{?/);
        if (simpleFor) {
          loopHeaderLine = i + 1;
          loopType = "for";
          loopCondition = simpleFor[1];
          break;
        }
      } else {
        loopHeaderLine = i + 1;
        loopType = "for";
        loopCondition = forMatch[1];
        break;
      }

      const whileMatch = line.match(/while\s*\((.+)\)\s*\{?/);
      if (whileMatch) {
        loopHeaderLine = i + 1;
        loopType = "while";
        loopCondition = whileMatch[1];
        break;
      }

      const doMatch = line.match(/do\s*\{?$/);
      if (doMatch) {
        loopHeaderLine = i + 1;
        loopType = "do-while";
        for (let j = currentLine; j < sourceLines.length && j < currentLine + 10; j++) {
          const fwdLine = (sourceLines[j] || "").trim();
          const dwMatch = fwdLine.match(/while\s*\((.+)\)/);
          if (dwMatch) {
            loopCondition = dwMatch[1];
            break;
          }
        }
        break;
      }
    }

    if (loopHeaderLine === -1) return null;

    // Also check that current line is at or after the loop header
    if (currentLine < loopHeaderLine) return null;

    // Count iterations: how many times has execution visited the loop header line
    // OR lines inside the loop body (for static trace where loop isn't unrolled)
    let iteration = 0;
    for (let i = 0; i <= currentStepIndex; i++) {
      if (steps[i].line === loopHeaderLine) {
        iteration++;
      }
    }

    // If only 1 visit to header, check how many times body lines repeat
    if (iteration <= 1) {
      // For static trace, estimate iteration from loop variable value
      const condVarMatch = loopCondition.match(/(\w+)\s*(?:=|<|>|<=|>=|!=)/);
      if (condVarMatch) {
        const loopVar = condVarMatch[1];
        if (currentStep.variables[loopVar]) {
          const val = parseInt(currentStep.variables[loopVar].value);
          if (!isNaN(val)) {
            iteration = Math.max(iteration, 1);
          }
        }
      }
      iteration = Math.max(iteration, 1);
    }

    // Find loop variable
    let loopVar = "";
    let loopVarValue = "";
    const condVarMatch = loopCondition.match(/(\w+)\s*(?:=|<|>|<=|>=|!=)/);
    if (condVarMatch) {
      loopVar = condVarMatch[1];
      if (currentStep.variables[loopVar]) {
        loopVarValue = currentStep.variables[loopVar].value;
      }
    }

    // Parse for-loop parts
    let initPart = "";
    let condPart = "";
    let updatePart = "";
    if (loopType === "for") {
      const parts = loopCondition.split(";").map((s) => s.trim());
      initPart = parts[0] || "";
      condPart = parts[1] || "";
      updatePart = parts[2] || "";
    } else {
      condPart = loopCondition;
    }

    return {
      loopType,
      loopHeaderLine,
      iteration,
      loopVar,
      loopVarValue,
      condition: condPart,
      initPart,
      updatePart,
      isActive: true,
    };
  }, [steps, currentStepIndex, sourceLines, currentStep]);

  if (!loopInfo) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-zinc-600 text-xs font-mono">
            Not inside a loop
          </div>
          <div className="text-zinc-700 text-[10px] mt-1">
            Loop details will appear when execution enters a loop
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-3">
      <div className="text-[9px] font-bold tracking-wider text-zinc-600 font-mono mb-1 px-1">
        LOOP VISUALIZATION
      </div>

      {/* Loop Header */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RefreshCw size={12} className="text-violet-400" />
            <span className="text-xs font-bold text-violet-300 font-mono uppercase">
              {loopInfo.loopType} loop
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500">
            Line {loopInfo.loopHeaderLine}
          </span>
        </div>

        {/* Iteration Counter */}
        <div className="bg-zinc-900/60 rounded-lg p-2.5 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-400">
              Iteration
            </span>
            <span className="text-lg font-bold font-mono text-violet-400">
              {loopInfo.iteration}
            </span>
          </div>
        </div>

        {/* Loop Variable */}
        {loopInfo.loopVar && (
          <div className="bg-zinc-900/60 rounded-lg p-2 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400">
                {loopInfo.loopVar}
              </span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {loopInfo.loopVarValue || "?"}
              </span>
            </div>
          </div>
        )}

        {/* Condition */}
        <div className="bg-zinc-900/60 rounded-lg p-2">
          <span className="text-[9px] text-zinc-500 font-mono block mb-1">
            condition
          </span>
          <code className="text-[11px] font-mono text-amber-400">
            {loopInfo.condition}
          </code>
        </div>

        {/* For loop parts */}
        {loopInfo.loopType === "for" && (
          <div className="mt-2 grid grid-cols-3 gap-1">
            <div className="bg-zinc-900/40 rounded p-1.5 text-center">
              <span className="text-[8px] text-zinc-600 font-mono block">
                init
              </span>
              <code className="text-[9px] font-mono text-zinc-400">
                {loopInfo.initPart}
              </code>
            </div>
            <div className="bg-zinc-900/40 rounded p-1.5 text-center">
              <span className="text-[8px] text-zinc-600 font-mono block">
                test
              </span>
              <code className="text-[9px] font-mono text-amber-400">
                {loopInfo.condition}
              </code>
            </div>
            <div className="bg-zinc-900/40 rounded p-1.5 text-center">
              <span className="text-[8px] text-zinc-600 font-mono block">
                update
              </span>
              <code className="text-[9px] font-mono text-zinc-400">
                {loopInfo.updatePart}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
