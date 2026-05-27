import React from 'react';
import { Terminal, Play, Save, ChevronRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-12 border-b border-white/10 bg-[#1a1d29]/80 backdrop-blur-xl flex items-center justify-between px-4 z-10 select-none">
      {/* Left: Brand and Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-500">
            {/* Elite geometric brand mark */}
            <Terminal size={12} />
          </div>
          <span className="font-semibold text-xs tracking-wider text-zinc-200">
            Code Editor and Visualizer
          </span>
        </div>
        
        <div className="h-4 w-[1px] bg-zinc-800"></div>
        
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
          <span className="hover:text-zinc-200 cursor-pointer transition-colors">Problems</span>
          <ChevronRight size={12} className="text-zinc-600" />
          <span className="text-zinc-200 cursor-pointer font-medium bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60">
            Workspace
          </span>
        </div>
      </div>

      
    </header>
  );
}