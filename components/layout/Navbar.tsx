"use client";

import React from "react";
import { Terminal, ChevronRight } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-12 border-b border-white/10 bg-[#1a1d29]/80 backdrop-blur-xl flex items-center justify-between px-4 z-10 select-none">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Terminal size={12} />
          </div>

          <span className="font-semibold text-xs tracking-wider text-zinc-200">
            Code Editor and Visualizer
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
          <span className="hover:text-zinc-200 cursor-pointer transition-colors">
            Problems
          </span>

          <ChevronRight size={12} className="text-zinc-600" />

          <span className="text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60">
            Workspace
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {session?.user ? (
          <>
            {/* Profile */}
            <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-zinc-700 bg-zinc-900/50">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-semibold text-sm">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <span className="text-sm text-zinc-200">
                {session.user.name}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors"
          >
            Login with Google
          </button>
        )}
      </div>
    </header>
  );
}