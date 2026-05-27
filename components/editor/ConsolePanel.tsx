export default function ConsolePanel({ output }) {
  return (
    <>
      {/* Console Output Block */}
      <div className="h-[30%] bg-[#0f1117] border-t border-white/10 flex flex-col min-h-[100px]">

        <div className="h-8 bg-[#0f1117] px-4 flex items-center border-b border-white/10 justify-between select-none">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 font-mono">
            CONSOLE
          </span>

          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="flex-1 p-3 font-mono text-xs text-emerald-500/90 bg-[#0f1117] overflow-y-auto leading-normal">

          <span className="text-zinc-600 block">
            &gt; dev-visualizer-engine --v1.0-mvp
          </span>

          <span className="block">
            {output || "> Waiting for execution..."}
          </span>

        </div>
      </div>
    </>
  );
}