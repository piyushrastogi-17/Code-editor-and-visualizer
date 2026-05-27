"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function EditorPanel({ code, setCode })  {
  const [language, setLanguage] = useState("javascript");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 border-b border-white/10 bg-[#0f1117] flex items-center justify-between px-3">
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#1a1a1a] border border-white/10 text-xs px-2 py-1 rounded text-zinc-300 outline-none"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
        />
      </div>
    </div>
  );
}
