import { Sparkles } from 'lucide-react';
export default function AiChatPanel () {
    return (
        <>
            {/* RIGHT INNER MODULE: AI Copilot Assistant Canvas Area */}
          <div className="w-[320px] xl:w-[360px] bg-gradient-to-b from-[#1a1d29] to-[#11131a] flex flex-col overflow-hidden rounded-2xl border border-white/10">
            <div className="h-9 border-b border-white/10 px-3 flex items-center gap-2 bg-[#262626] select-none">
              <Sparkles size={12} className="text-amber-500" />
              <span className="text-xs font-semibold text-zinc-300 tracking-wide">AI Assistant</span>
            </div>
        </div>
        </>
    );
}