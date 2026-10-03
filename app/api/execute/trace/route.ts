import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { gdbTrace, staticTrace, isGdbAvailable } from "@/lib/traceEngine";

export async function POST(req: NextRequest) {
  try {
    const { code, language, input } = await req.json();

    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, error: "No code provided", steps: [], totalSteps: 0, sourceLines: [] },
        { status: 400 }
      );
    }

    // For non-C++ languages, use static analysis only
    if (language !== "cpp") {
      const result = staticTrace(code);
      return NextResponse.json(result);
    }

    // ─── C++ Trace ──────────────────────────────────────────────
    const uniqueId = crypto.randomUUID();
    const tempDir = path.join(process.cwd(), "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const sourcePath = path.join(tempDir, `trace-${uniqueId}.cpp`);
    const executablePath = path.join(tempDir, `trace-${uniqueId}.exe`);
    const inputPath = path.join(tempDir, `trace-${uniqueId}.txt`);

    fs.writeFileSync(sourcePath, code);
    fs.writeFileSync(inputPath, input || "");

    const cleanup = () => {
      const files = [sourcePath, executablePath, inputPath];
      for (const f of files) {
        try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch { /* ignore */ }
      }
      // Also clean up gdb script and output files
      const gdbFiles = [
        sourcePath.replace(".cpp", "-gdb.txt"),
        sourcePath.replace(".cpp", "-gdb-out.txt"),
      ];
      for (const f of gdbFiles) {
        try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch { /* ignore */ }
      }
    };

    try {
      // Step 1: Compile with debug info
      try {
        execSync(
          `"C:\\MinGW\\bin\\g++.exe" -g -O0 "${sourcePath}" -o "${executablePath}"`,
          { timeout: 15000, stdio: "pipe" }
        );
      } catch (compileErr: unknown) {
        const err = compileErr as { stderr?: Buffer; message?: string };
        const errorMsg = err.stderr?.toString() || err.message || "Compilation failed";
        cleanup();
        return NextResponse.json({
          success: false,
          error: errorMsg,
          steps: [],
          totalSteps: 0,
          sourceLines: code.split("\n"),
          compilationOutput: errorMsg,
        });
      }

      // Step 2: Try GDB trace, fall back to static
      let result;
      if (isGdbAvailable()) {
        result = await gdbTrace(sourcePath, executablePath, inputPath, code);
      } else {
        result = staticTrace(code);
      }

      cleanup();
      return NextResponse.json(result);
    } catch (error) {
      cleanup();
      // Final fallback
      const result = staticTrace(code);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Trace API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown Error",
        steps: [],
        totalSteps: 0,
        sourceLines: [],
      },
      { status: 500 }
    );
  }
}
