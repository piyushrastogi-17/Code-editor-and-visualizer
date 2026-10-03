"use client";

import React from "react";
import { useVisualizationStore } from "@/store/useVisualizationStore";

export default function ExecutionTimeline() {
  const { steps, currentStepIndex, goToStep } = useVisualizationStore();

  if (steps.length === 0) return null;

  return (
    <div className="px-2 py-1.5">
      <div className="text-[9px] font-bold tracking-wider text-zinc-600 font-mono mb-1.5">
        EXECUTION TIMELINE
      </div>
      <div className="flex gap-[2px] flex-wrap">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            className={`group relative w-5 h-5 rounded text-[8px] font-mono font-bold flex items-center justify-center transition-all duration-150 ${
              i === currentStepIndex
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-110 z-10"
                : i < currentStepIndex
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-zinc-800/40 text-zinc-600 hover:bg-zinc-700/40 hover:text-zinc-400"
            }`}
            title={`Step ${i + 1} — Line ${step.line}`}
          >
            {step.line}

            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 rounded px-1.5 py-0.5 text-[8px] text-zinc-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
              Step {i + 1} · L{step.line}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
