"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import EditorPanel from "../editor/EditorPanel";
import ConsolePanel from "../editor/ConsolePanel";
import AiChatPanel from "../ai/AiChatPanel";
import { CornerDownLeft, Save, Play } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function MainLayout() {
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [input, setInput] = useState("");
  const { data: session } = useSession();

  const searchParams = useSearchParams();

  useEffect(() => {
  const projectId = searchParams.get("projectId");

  if (!projectId) return;

  const loadProject = async () => {
    try {
      const response = await fetch(
        `/api/projects?projectId=${projectId}`
      );

      const data = await response.json();

      if (data.success && data.project) {
        setCode(data.project.code);
        setLanguage(data.project.language);
      }
    } catch (error) {
      console.error(error);
    }
  };

  loadProject();
}, [searchParams]);
  const handleSaveProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Project",
          code,
          language,
          userEmail: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Project Saved Successfully!");
      } else {
        alert(data.error || "Failed to save project");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0f1117] text-zinc-200 font-sans antialiased">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Outer Inner Container */}
      <div className="flex-1 flex overflow-hidden w-full p-2 gap-2">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Workspace core canvas workspace split */}
        <div className="flex-1 flex overflow-hidden bg-[#0f1117] rounded-2xl">
          {/* LEFT INNER MODULE: Editor + Console Deck */}

          <div className="flex-1 flex flex-col border border-white/10 overflow-hidden rounded-2xl bg-[#11131a]">
            {/* 🚀 RUN BUTTON CORNER HEADER (Yahan fit karo) */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#161922]">
              <span className="text-xs font-semibold text-zinc-400 tracking-wider font-mono">
                WORKSPACE
              </span>

              {/* Right: Core CTA Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveProject}
                  className="h-7 px-3 text-xs font-medium bg-zinc-800 border border-zinc-700/80 hover:bg-zinc-700/60 rounded text-zinc-300 flex items-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <Save size={13} className="text-zinc-400" />
                  Save Code
                </button>

                <button
                  onClick={async () => {
                    try {
                      setIsRunning(true);
                      const response = await fetch("/api/execute", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          code,
                          language,
                          input,
                        }),
                      });

                      const data = await response.json();

                      setOutput(data.output);
                      setIsRunning(false);
                    } catch (error) {
                      setOutput("Something went wrong");
                      setIsRunning(false);
                    }
                  }}
                  className="h-7 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Play size={11} fill="currentColor" />
                  {isRunning ? "Running..." : "Run"}
                </button>
              </div>
            </div>
            <EditorPanel
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
            />
            <ConsolePanel output={output} input={input} setInput={setInput} />
          </div>

          {/* Inside Chat Stream Message Bubble Wrapper */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            <div className="bg-[#262626]/60 border border-white/10 p-3 rounded text-xs text-zinc-300 leading-relaxed shadow-sm">
              Hey developer! Write your algorithms here. Run your execution
              parameters to visualize real-time structure tracing frames
              instantly.
            </div>
          </div>
          <AiChatPanel code={code} language={language} output={output} />

          {/* Premium LeetCode Style Action Input element prompt box */}
          <div className="p-2 border-t border-white/10 bg-[#1a1a1a]">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask Assistant (e.g. Trace loop context)..."
                className="w-full bg-[#262626] border border-white/10 rounded px-2.5 py-1.5 pr-7 text-xs text-zinc-200 outline-none focus:border-zinc-700 transition-colors placeholder-zinc-600 font-medium"
              />

              <div className="absolute right-2 text-[10px] bg-zinc-800 border border-zinc-700 px-1 py-0.5 rounded text-zinc-500 font-mono flex items-center gap-0.5">
                <CornerDownLeft size={8} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
