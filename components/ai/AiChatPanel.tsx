"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send } from "lucide-react";

interface AiChatPanelProps {
  code: string;
  language: string;
  output: string;
}

export default function AiChatPanel({
  code,
  language,
  output,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! How can I help you with your code today?",
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    if (!customPrompt && !input.trim()) return;

    const message = customPrompt || input;
    const userMessage = message;

    // User message add karo
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          code,
          language,
          output,
        }),
      });

      const data = await response.json();

      // AI response add karo
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to connect to AI service.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[320px] xl:w-[360px] bg-gradient-to-b from-[#1a1d29] to-[#11131a] flex flex-col overflow-hidden rounded-2xl border border-white/10">
      {/* Header */}
      <div className="h-9 border-b border-white/10 px-3 flex items-center gap-2 bg-[#262626]">
        <Sparkles size={12} className="text-amber-500" />
        <span className="text-xs font-semibold text-zinc-300 tracking-wide">
          AI Assistant
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`text-sm p-2 rounded-lg max-w-[90%] ${
              msg.role === "user"
                ? "ml-auto bg-green-600 text-white"
                : "bg-zinc-800 text-zinc-200"
            }`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}

        {isLoading && (
          <div className="bg-zinc-800 text-zinc-200 text-sm p-2 rounded-lg max-w-[90%]">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-2 flex flex-wrap gap-2 border-t border-white/10">
        <button
          onClick={() => handleSend("Explain my code step by step.")}
          className="text-xs px-2 py-1 bg-zinc-700 rounded-md hover:bg-zinc-600"
        >
          Explain Code
        </button>

        <button
          onClick={() =>
            handleSend("Analyze the error in my code and suggest a fix.")
          }
          className="text-xs px-2 py-1 bg-zinc-700 rounded-md hover:bg-zinc-600"
        >
          Explain Error
        </button>

        <button
          onClick={() =>
            handleSend("Optimize my code and improve its complexity.")
          }
          className="text-xs px-2 py-1 bg-zinc-700 rounded-md hover:bg-zinc-600"
        >
          Optimize Code
        </button>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-2 flex gap-2">
        <input
          type="text"
          placeholder="Ask AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#0d1117] text-white text-sm px-3 py-2 rounded-md outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="bg-green-600 px-3 rounded-md flex items-center justify-center disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}