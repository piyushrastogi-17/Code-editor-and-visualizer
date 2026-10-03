"use client";

import React, { useState } from "react";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import ExecutionControls from "./ExecutionControls";
import VariablesPanel from "./VariablesPanel";
import CallStackPanel from "./CallStackPanel";
import MemoryPanel from "./MemoryPanel";
import LoopVisualization from "./LoopVisualization";
import ExecutionTimeline from "./ExecutionTimeline";
import { Eye, AlertTriangle, Loader2 } from "lucide-react";

type TabKey = "variables" | "callstack" | "memory" | "loops";

const TABS: { key: TabKey; label: string }[] = [
  { key: "variables", label: "Variables" },
  { key: "callstack", label: "Call Stack" },
  { key: "memory", label: "Memory" },
  { key: "loops", label: "Loops" },
];

export default function VisualizationPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("variables");
  const { hasTrace, isTracing, traceError, steps, currentStepIndex } =
    useVisualizationStore();

  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-9 border-b border-white/5 px-3 flex items-center gap-2 bg-[#161922] shrink-0">
        <Eye size={12} className="text-emerald-500" />
        <span className="text-xs font-semibold text-zinc-300 tracking-wide">
          Visualization
        </span>
        {hasTrace && currentStep && (
          <span className="ml-auto text-[10px] font-mono text-zinc-500">
            fn:{" "}
            <span className="text-zinc-300">{currentStep.function}()</span>
          </span>
        )}
      </div>

      {/* Loading State */}
      {isTracing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2
              size={24}
              className="text-emerald-500 animate-spin mx-auto"
            />
            <div className="text-xs text-zinc-400">
              Tracing execution...
            </div>
            <div className="text-[10px] text-zinc-600">
              Compiling and instrumenting your code
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isTracing && traceError && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-2 max-w-[240px]">
            <AlertTriangle
              size={20}
              className="text-red-400 mx-auto"
            />
            <div className="text-xs text-red-400 font-semibold">
              Trace Error
            </div>
            <pre className="text-[10px] text-zinc-400 font-mono bg-zinc-900/60 rounded-lg p-2 text-left overflow-auto max-h-32 whitespace-pre-wrap">
              {traceError}
            </pre>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isTracing && !traceError && !hasTrace && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Eye size={16} className="text-emerald-500" />
            </div>
            <div className="text-xs text-zinc-400">
              No visualization yet
            </div>
            <div className="text-[10px] text-zinc-600 max-w-[200px]">
              Click <strong className="text-emerald-400">Visualize</strong> to
              trace your code execution step by step
            </div>
          </div>
        </div>
      )}

      {/* Active Visualization */}
      {!isTracing && hasTrace && (
        <>
          {/* Controls */}
          <div className="px-2 py-2 border-b border-white/5 shrink-0">
            <ExecutionControls />
          </div>

          {/* Timeline */}
          <div className="border-b border-white/5 shrink-0">
            <ExecutionTimeline />
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-white/5 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 text-[10px] font-semibold tracking-wide transition-all ${
                  activeTab === tab.key
                    ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === "variables" && <VariablesPanel />}
            {activeTab === "callstack" && <CallStackPanel />}
            {activeTab === "memory" && <MemoryPanel />}
            {activeTab === "loops" && <LoopVisualization />}
          </div>

          {/* Current Source Line */}
          {currentStep && (
            <div className="px-2 py-1.5 border-t border-white/5 bg-zinc-900/40 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-zinc-600">
                  L{currentStep.line}
                </span>
                <code className="text-[10px] font-mono text-zinc-400 truncate">
                  {currentStep.sourceCode?.trim()}
                </code>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
