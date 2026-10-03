"use client";

import React from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Gauge,
} from "lucide-react";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import type { PlaybackSpeed } from "@/types/execution";

const speeds: PlaybackSpeed[] = [0.5, 1, 2, 4];

export default function ExecutionControls() {
  const {
    isPlaying,
    currentStepIndex,
    totalSteps,
    steps,
    playbackSpeed,
    play,
    pause,
    nextStep,
    prevStep,
    restart,
    goToStep,
    setPlaybackSpeed,
  } = useVisualizationStore();

  const hasSteps = steps.length > 0;
  const isAtStart = currentStepIndex === 0;
  const isAtEnd = currentStepIndex >= steps.length - 1;

  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex flex-col gap-2">
      {/* Step Info */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-wider text-zinc-500 font-mono">
          EXECUTION CONTROLS
        </span>
        {hasSteps && (
          <span className="text-[10px] font-mono text-zinc-400">
            Line{" "}
            <span className="text-amber-400">
              {currentStep?.line || "—"}
            </span>
          </span>
        )}
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center gap-1.5">
        {/* Restart */}
        <button
          onClick={restart}
          disabled={!hasSteps}
          className="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-800/60 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Restart"
        >
          <RotateCcw size={12} />
        </button>

        {/* Prev */}
        <button
          onClick={prevStep}
          disabled={!hasSteps || isAtStart}
          className="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-800/60 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Previous Step"
        >
          <SkipBack size={12} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={isPlaying ? pause : play}
          disabled={!hasSteps}
          className={`h-8 w-8 flex items-center justify-center rounded-xl border transition-all duration-200 ${
            isPlaying
              ? "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
              : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={13} fill="currentColor" />
          ) : (
            <Play size={13} fill="currentColor" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextStep}
          disabled={!hasSteps || isAtEnd}
          className="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-800/60 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Next Step"
        >
          <SkipForward size={12} />
        </button>

        {/* Step Counter */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs font-mono text-zinc-500">
            {hasSteps ? (
              <>
                <span className="text-zinc-200">{currentStepIndex + 1}</span>
                <span className="text-zinc-600"> / </span>
                <span>{steps.length}</span>
              </>
            ) : (
              "—"
            )}
          </span>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1">
          <Gauge size={10} className="text-zinc-500" />
          <select
            value={playbackSpeed}
            onChange={(e) =>
              setPlaybackSpeed(parseFloat(e.target.value) as PlaybackSpeed)
            }
            className="bg-zinc-800/60 border border-white/5 text-[10px] font-mono text-zinc-400 rounded px-1 py-0.5 outline-none cursor-pointer"
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Slider */}
      {hasSteps && (
        <div className="relative">
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(parseInt(e.target.value))}
            className="w-full h-1 appearance-none bg-zinc-800 rounded-full outline-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          {/* Progress bar background */}
          <div
            className="absolute top-0 left-0 h-1 bg-emerald-500/30 rounded-full pointer-events-none"
            style={{
              width: `${(currentStepIndex / Math.max(steps.length - 1, 1)) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
