"use client";

import React from "react";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { Variable } from "@/types/execution";

export default function VariablesPanel() {
  const { steps, currentStepIndex } = useVisualizationStore();

  const currentStep = steps[currentStepIndex];
  const variables = currentStep?.variables || {};
  const varList = Object.values(variables);

  // Separate by scope
  const params = varList.filter((v) => v.scope === "parameter");
  const locals = varList.filter((v) => v.scope === "local");

  if (varList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-zinc-600 text-xs font-mono">
            No variables in scope
          </div>
          <div className="text-zinc-700 text-[10px] mt-1">
            Variables will appear here during execution
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-3">
      {params.length > 0 && (
        <VarGroup title="PARAMETERS" variables={params} />
      )}
      {locals.length > 0 && (
        <VarGroup title="LOCAL VARIABLES" variables={locals} />
      )}
    </div>
  );
}

function VarGroup({
  title,
  variables,
}: {
  title: string;
  variables: Variable[];
}) {
  return (
    <div>
      <div className="text-[9px] font-bold tracking-wider text-zinc-600 font-mono mb-1.5 px-1">
        {title}
      </div>
      <div className="space-y-1">
        {variables.map((v) => (
          <div
            key={v.name}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${
              v.changed
                ? "bg-amber-500/10 border-amber-500/20 shadow-sm shadow-amber-500/10"
                : "bg-zinc-800/40 border-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Type badge */}
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  v.changed
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-zinc-700/60 text-zinc-500"
                }`}
              >
                {v.type}
              </span>

              {/* Name */}
              <span className="text-xs font-semibold text-zinc-200 font-mono">
                {v.name}
              </span>
            </div>

            {/* Value */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">=</span>
              <span
                className={`text-xs font-mono font-bold transition-all duration-300 ${
                  v.changed ? "text-amber-400 scale-105" : "text-emerald-400"
                }`}
              >
                {v.value}
              </span>
              {v.changed && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
