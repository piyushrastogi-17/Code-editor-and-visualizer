import React from "react";
import { Files, Activity, Settings, Cpu } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-12 h-full border border-white/10 bg-[#1a1d29]/80 backdrop-blur-xl flex flex-col justify-between py-2 items-center select-none rounded-2xl">
      {/* Top Stack */}
      <div className="flex flex-col gap-1 w-full px-1.5">
        {/* Active Item style (Leetcode border left highlight) */}
        <div
          className="w-9 h-9 flex items-center justify-center rounded-xl 
bg-gradient-to-b from-amber-500/20 to-amber-600/10
text-amber-500 
cursor-pointer 
border border-amber-500/20
shadow-lg shadow-amber-500/10
transition-all duration-200
hover:scale-105"
        >
          <Files size={16} />
        </div>

        <div className="w-9 h-9 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 cursor-pointer transition-all duration-200 hover:scale-105">
          <Cpu size={16} />
        </div>

        <div className="w-9 h-9 flex items-center justify-center rounded text-zinc-500  duration-200 hover:scale-105">
          <Activity size={16} />
        </div>
      </div>

      {/* Settings Bottom Item */}
      <div className="w-9 h-9 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 cursor-pointer transition-colors">
        <Settings size={16} />
      </div>
    </aside>
  );
}
