// ─── Variable State ─────────────────────────────────────────────
export interface Variable {
  name: string;
  type: string;
  value: string;
  scope: "local" | "global" | "parameter";
  changed: boolean;
}

// ─── Stack Frame ────────────────────────────────────────────────
export interface StackFrame {
  function: string;
  file: string;
  line: number;
  args: Variable[];
  locals: Variable[];
}

// ─── Loop State ─────────────────────────────────────────────────
export interface LoopState {
  isInLoop: boolean;
  iteration: number;
  loopVariable?: string;
  loopCondition?: string;
  conditionResult?: boolean;
}

// ─── Single Execution Step ──────────────────────────────────────
export interface ExecutionStep {
  step: number;
  line: number;
  previousLine: number | null;
  sourceCode: string;
  function: string;
  variables: Record<string, Variable>;
  stack: StackFrame[];
  output: string;
  cumulativeOutput: string;
  status: "running" | "completed" | "error" | "paused";
  error?: string;
  loopState?: LoopState;
}

// ─── Full Trace Result ──────────────────────────────────────────
export interface TraceResult {
  success: boolean;
  steps: ExecutionStep[];
  error?: string;
  totalSteps: number;
  sourceLines: string[];
  compilationOutput?: string;
}

// ─── Execution Request ──────────────────────────────────────────
export interface ExecuteRequest {
  code: string;
  language: string;
  input?: string;
}

// ─── Playback Speed ─────────────────────────────────────────────
export type PlaybackSpeed = 0.5 | 1 | 2 | 4;
