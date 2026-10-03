"use client";

import { create } from "zustand";
import type {
  ExecutionStep,
  PlaybackSpeed,
  TraceResult,
} from "@/types/execution";

// ─── Store State ────────────────────────────────────────────────
interface VisualizationState {
  // Trace data
  steps: ExecutionStep[];
  sourceLines: string[];
  totalSteps: number;
  compilationOutput: string;
  traceError: string;

  // Playback
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  playIntervalId: ReturnType<typeof setInterval> | null;

  // Status
  isTracing: boolean;
  hasTrace: boolean;

  // ─── Actions ────────────────────────────────────────────────
  setTraceResult: (result: TraceResult) => void;
  reset: () => void;

  // Playback controls
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  prevStep: () => void;
  restart: () => void;
  goToStep: (index: number) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;

  // Tracing status
  setIsTracing: (v: boolean) => void;
  setTraceError: (err: string) => void;

  // Computed getters
  getCurrentStep: () => ExecutionStep | null;
  getCurrentLine: () => number | null;
  getVariables: () => Record<string, ExecutionStep["variables"][string]>;
  getStack: () => ExecutionStep["stack"];
}

// ─── Store ──────────────────────────────────────────────────────
export const useVisualizationStore = create<VisualizationState>(
  (set, get) => ({
    // Initial state
    steps: [],
    sourceLines: [],
    totalSteps: 0,
    compilationOutput: "",
    traceError: "",
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 1,
    playIntervalId: null,
    isTracing: false,
    hasTrace: false,

    // ─── Set trace result from API ────────────────────────────
    setTraceResult: (result) => {
      const state = get();
      if (state.playIntervalId) {
        clearInterval(state.playIntervalId);
      }

      set({
        steps: result.steps,
        sourceLines: result.sourceLines,
        totalSteps: result.totalSteps,
        compilationOutput: result.compilationOutput || "",
        traceError: result.success ? "" : result.error || "Trace failed",
        currentStepIndex: 0,
        isPlaying: false,
        playIntervalId: null,
        hasTrace: result.steps.length > 0,
        isTracing: false,
      });
    },

    reset: () => {
      const state = get();
      if (state.playIntervalId) {
        clearInterval(state.playIntervalId);
      }
      set({
        steps: [],
        sourceLines: [],
        totalSteps: 0,
        compilationOutput: "",
        traceError: "",
        currentStepIndex: 0,
        isPlaying: false,
        playIntervalId: null,
        hasTrace: false,
        isTracing: false,
      });
    },

    // ─── Playback Controls ────────────────────────────────────
    play: () => {
      const state = get();
      if (state.isPlaying || state.steps.length === 0) return;

      // If at the end, restart from beginning
      if (state.currentStepIndex >= state.steps.length - 1) {
        set({ currentStepIndex: 0 });
      }

      const speedMs = Math.round(1000 / state.playbackSpeed);

      const intervalId = setInterval(() => {
        const s = get();
        if (s.currentStepIndex >= s.steps.length - 1) {
          clearInterval(intervalId);
          set({ isPlaying: false, playIntervalId: null });
          return;
        }
        set({ currentStepIndex: s.currentStepIndex + 1 });
      }, speedMs);

      set({ isPlaying: true, playIntervalId: intervalId });
    },

    pause: () => {
      const state = get();
      if (state.playIntervalId) {
        clearInterval(state.playIntervalId);
      }
      set({ isPlaying: false, playIntervalId: null });
    },

    nextStep: () => {
      const state = get();
      if (state.currentStepIndex < state.steps.length - 1) {
        // Pause if playing
        if (state.isPlaying && state.playIntervalId) {
          clearInterval(state.playIntervalId);
          set({ isPlaying: false, playIntervalId: null });
        }
        set({ currentStepIndex: state.currentStepIndex + 1 });
      }
    },

    prevStep: () => {
      const state = get();
      if (state.currentStepIndex > 0) {
        if (state.isPlaying && state.playIntervalId) {
          clearInterval(state.playIntervalId);
          set({ isPlaying: false, playIntervalId: null });
        }
        set({ currentStepIndex: state.currentStepIndex - 1 });
      }
    },

    restart: () => {
      const state = get();
      if (state.playIntervalId) {
        clearInterval(state.playIntervalId);
      }
      set({
        currentStepIndex: 0,
        isPlaying: false,
        playIntervalId: null,
      });
    },

    goToStep: (index) => {
      const state = get();
      if (index >= 0 && index < state.steps.length) {
        if (state.isPlaying && state.playIntervalId) {
          clearInterval(state.playIntervalId);
          set({ isPlaying: false, playIntervalId: null });
        }
        set({ currentStepIndex: index });
      }
    },

    setPlaybackSpeed: (speed) => {
      const state = get();
      set({ playbackSpeed: speed });

      // If currently playing, restart interval with new speed
      if (state.isPlaying && state.playIntervalId) {
        clearInterval(state.playIntervalId);
        const speedMs = Math.round(1000 / speed);
        const intervalId = setInterval(() => {
          const s = get();
          if (s.currentStepIndex >= s.steps.length - 1) {
            clearInterval(intervalId);
            set({ isPlaying: false, playIntervalId: null });
            return;
          }
          set({ currentStepIndex: s.currentStepIndex + 1 });
        }, speedMs);
        set({ playIntervalId: intervalId });
      }
    },

    setIsTracing: (v) => set({ isTracing: v }),
    setTraceError: (err) => set({ traceError: err }),

    // ─── Computed getters ─────────────────────────────────────
    getCurrentStep: () => {
      const state = get();
      return state.steps[state.currentStepIndex] || null;
    },

    getCurrentLine: () => {
      const state = get();
      const step = state.steps[state.currentStepIndex];
      return step ? step.line : null;
    },

    getVariables: () => {
      const state = get();
      const step = state.steps[state.currentStepIndex];
      return step ? step.variables : {};
    },

    getStack: () => {
      const state = get();
      const step = state.steps[state.currentStepIndex];
      return step ? step.stack : [];
    },
  })
);
