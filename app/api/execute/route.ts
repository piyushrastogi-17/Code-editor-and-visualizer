import { NextRequest, NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { code, language, input } = body;

    if (language === "python") {
      const output = await new Promise((resolve, reject) => {
        const fileName = `temp-${crypto.randomUUID()}.py`;

        const filePath = path.join(process.cwd(), fileName);

        fs.writeFileSync(filePath, code);

        const pythonProcess = spawn("python", [filePath]);

        let result = "";
        let errorResult = "";

        pythonProcess.stdout.on("data", (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
          errorResult += data.toString();
        });

        pythonProcess.on("close", () => {
          fs.unlinkSync(filePath);

          if (errorResult) {
            reject(errorResult);
          } else {
            resolve(result);
          }
        });

        if (pythonProcess.stdin) {
          pythonProcess.stdin.write((input || "") + "\n");
          pythonProcess.stdin.end();
        }
      });

      return NextResponse.json({
        success: true,
        output,
      });
    }
    if (language === "javascript") {
      const output = await new Promise((resolve, reject) => {
        const fileName = `temp-${crypto.randomUUID()}.js`;

        const filePath = path.join(process.cwd(), fileName);

        fs.writeFileSync(filePath, code);

        exec(`node ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
          } else {
            fs.unlinkSync(filePath);
            resolve(stdout);
          }
        });
      });

      return NextResponse.json({
        success: true,
        output,
      });
    }

    if (language === "cpp") {
      const uniqueId = crypto.randomUUID();

      const tempDir = path.join(process.cwd(), "temp");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `temp-${uniqueId}.cpp`;
      const filePath = path.join(tempDir, fileName);

      const isWindows = process.platform === "win32";

      const outputPath = isWindows
        ? filePath.replace(".cpp", ".exe")
        : filePath.replace(".cpp", "");

      const inputPath = filePath.replace(".cpp", ".txt");

      fs.writeFileSync(filePath, code);
      fs.writeFileSync(inputPath, input || "");
      console.log("INPUT RECEIVED:", input);
      console.log("INPUT FILE:", fs.readFileSync(inputPath, "utf8"));

      const cleanupFiles = () => {
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        } catch (err) {
          console.error("Cleanup Error:", err);
        }
      };

      try {
        const output = await new Promise<string>((resolve, reject) => {
          const compileCommand = `g++ "${filePath}" -o "${outputPath}"`;

          console.log("Compile Command:", compileCommand);

          exec(compileCommand, (compileError, _, compileStderr) => {
            if (compileError) {
              cleanupFiles();
              return reject(
                compileStderr || compileError.message || "Compilation failed",
              );
            }

            const runCommand = isWindows
              ? `"${outputPath}" < "${inputPath}"`
              : `"${outputPath}" < "${inputPath}"`;

            console.log("Run Command:", runCommand);

            exec(
              runCommand,
              {
                timeout: 5000,
              },
              (runtimeError, stdout, stderr) => {
                cleanupFiles();

                if (runtimeError) {
                  return reject(
                    stderr || runtimeError.message || "Runtime error",
                  );
                }

                resolve(stdout || "");
              },
            );
          });
        });

        return NextResponse.json({
          success: true,
          output,
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: String(error),
          },
          {
            status: 400,
          },
        );
      }
    }
    return NextResponse.json({
      success: false,
      output: "Language not supported",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      output: String(error),
    });
  }
}
