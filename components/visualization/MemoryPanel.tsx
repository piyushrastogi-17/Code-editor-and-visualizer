"use client";

import React from "react";
import { useVisualizationStore } from "@/store/useVisualizationStore";

export default function MemoryPanel() {
  const { steps, currentStepIndex } = useVisualizationStore();

  const currentStep = steps[currentStepIndex];
  const variables = currentStep?.variables || {};
  const varList = Object.values(variables);

  if (varList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-zinc-600 text-xs font-mono">
            No memory allocated
          </div>
          <div className="text-zinc-700 text-[10px] mt-1">
            Memory layout will appear during execution
          </div>
        </div>
      </div>
    );
  }

  // Detect arrays: variables with names like arr[0], arr[1], or values like {1, 2, 3}
  const arrays: Record<string, { values: string[]; type: string }> = {};
  const scalars: typeof varList = [];

  for (const v of varList) {
    // Check if value looks like an array: {1, 2, 3}
    const arrMatch = v.value.match(/^\{(.+)\}$/);
    if (arrMatch) {
      arrays[v.name] = {
        values: arrMatch[1].split(",").map((s) => s.trim()),
        type: v.type,
      };
    } else {
      scalars.push(v);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-3">
      <div className="text-[9px] font-bold tracking-wider text-zinc-600 font-mono mb-1 px-1">
        MEMORY VIEW
      </div>

      {/* Stack frame visualization */}
      <div className="border border-white/5 rounded-lg overflow-hidden">
        <div className="bg-zinc-800/60 px-2 py-1">
          <span className="text-[9px] font-mono text-zinc-400 tracking-wider">
            STACK FRAME: {currentStep?.function || "main"}()
          </span>
        </div>

        <div className="p-1.5 space-y-0.5">
          {scalars.map((v) => (
            <div
              key={v.name}
              className={`flex items-stretch rounded transition-all duration-300 ${
                v.changed ? "ring-1 ring-amber-500/30" : ""
              }`}
            >
              {/* Address placeholder */}
              <div className="w-16 flex items-center justify-center bg-zinc-900/60 border-r border-white/5 px-1">
                <span className="text-[8px] font-mono text-zinc-600">
                  0x{Math.abs(hashCode(v.name)).toString(16).slice(0, 4).padStart(4, "0")}
                </span>
              </div>

              {/* Variable name */}
              <div className="w-16 flex items-center px-2 bg-zinc-800/30 border-r border-white/5">
                <span className="text-[10px] font-mono text-zinc-300 truncate">
                  {v.name}
                </span>
              </div>

              {/* Value box */}
              <div
                className={`flex-1 flex items-center justify-center px-2 py-1.5 transition-all duration-300 ${
                  v.changed
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-zinc-800/20 text-emerald-400"
                }`}
              >
                <span className="text-xs font-mono font-bold">{v.value}</span>
              </div>

              {/* Type */}
              <div className="w-12 flex items-center justify-center bg-zinc-900/40 border-l border-white/5">
                <span className="text-[8px] font-mono text-zinc-600">
                  {v.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Array visualizations */}
      {Object.entries(arrays).map(([name, arr]) => (
        <div key={name}>
          <div className="text-[9px] font-mono text-zinc-500 mb-1 px-1">
            {name} ({arr.type})
          </div>
          <div className="flex gap-0.5 overflow-x-auto pb-1">
            {arr.values.map((val, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-10 h-8 flex items-center justify-center bg-zinc-800/60 border border-white/10 rounded text-xs font-mono text-emerald-400 font-bold">
                  {val}
                </div>
                <span className="text-[8px] font-mono text-zinc-600 mt-0.5">
                  [{i}]
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}
