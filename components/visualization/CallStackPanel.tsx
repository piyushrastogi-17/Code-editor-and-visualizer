"use client";

import React from "react";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { ArrowDown } from "lucide-react";

export default function CallStackPanel() {
  const { steps, currentStepIndex } = useVisualizationStore();

  const currentStep = steps[currentStepIndex];
  const stack = currentStep?.stack || [];

  if (stack.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-zinc-600 text-xs font-mono">
            No active stack frames
          </div>
          <div className="text-zinc-700 text-[10px] mt-1">
            Function calls will appear here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
      <div className="text-[9px] font-bold tracking-wider text-zinc-600 font-mono mb-1 px-1">
        CALL STACK
      </div>

      {stack.map((frame, index) => (
        <React.Fragment key={index}>
          <div
            className={`rounded-lg border p-2.5 transition-all ${
              index === 0
                ? "bg-emerald-500/10 border-emerald-500/20 shadow-sm shadow-emerald-500/10"
                : "bg-zinc-800/40 border-white/5"
            }`}
          >
            {/* Function Name */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    index === 0
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-zinc-700/60 text-zinc-500"
                  }`}
                >
                  #{index}
                </span>
                <span className="text-xs font-bold font-mono text-zinc-200">
                  {frame.function}()
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                L{frame.line}
              </span>
            </div>

            {/* Arguments */}
            {frame.args.length > 0 && (
              <div className="mt-1 space-y-0.5">
                <span className="text-[9px] text-zinc-600 font-mono">
                  args:
                </span>
                {frame.args.map((arg) => (
                  <div
                    key={arg.name}
                    className="flex items-center gap-1.5 pl-2"
                  >
                    <span className="text-[10px] font-mono text-zinc-400">
                      {arg.name}
                    </span>
                    <span className="text-[10px] text-zinc-600">=</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {arg.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Locals summary */}
            {frame.locals.length > 0 && (
              <div className="mt-1">
                <span className="text-[9px] text-zinc-600 font-mono">
                  {frame.locals.length} local
                  {frame.locals.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Arrow between frames */}
          {index < stack.length - 1 && (
            <div className="flex justify-center">
              <ArrowDown size={10} className="text-zinc-600" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
