import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  ChevronLeft,
  Phone,
  Video,
  Sparkles,
} from "lucide-react";

interface ChatSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  detectedApp?: string;
  contextSnippet?: string;
}

export const ChatSimulatorModal: React.FC<ChatSimulatorModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  detectedApp = "iMessage",
  contextSnippet,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>(
    detectedApp.toLowerCase().includes("insta")
      ? "instagram"
      : detectedApp.toLowerCase().includes("hinge")
      ? "hinge"
      : detectedApp.toLowerCase().includes("tinder")
      ? "tinder"
      : detectedApp.toLowerCase().includes("bumble")
      ? "bumble"
      : "imessage"
  );

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getBubbleStyle = () => {
    switch (activeTheme) {
      case "instagram":
        return "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]";
      case "hinge":
        return "bg-[#5e2d40] text-white border border-rose-900/40";
      case "tinder":
        return "bg-gradient-to-r from-[#fd5068] to-[#ff7854] text-white shadow-[0_0_15px_rgba(253,80,104,0.3)]";
      case "bumble":
        return "bg-[#f3b924] text-black font-semibold shadow-[0_0_15px_rgba(243,185,36,0.3)]";
      default:
        return "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)]";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0a0a0c] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/[0.05] border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Theme Selector Tabs */}
        <div className="px-4 pt-4 pb-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Live Preview HUD
          </span>
          <div className="flex gap-1 pr-7">
            {["imessage", "instagram", "hinge", "tinder", "bumble"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTheme(t)}
                className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-md transition-all ${
                  activeTheme === t
                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-black shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    : "bg-black/60 border border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {t === "imessage" ? "iOS" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Mock Phone Chat View */}
        <div className="p-4 bg-[#030303] flex flex-col h-[400px] justify-between">
          {/* Mock Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 border border-white/20 flex items-center justify-center text-[11px] font-bold text-white font-mono">
                M
              </div>
              <div>
                <p className="text-xs font-bold text-white font-mono leading-tight">Match / Contact</p>
                <p className="text-[9px] text-emerald-400 font-mono">● Active now</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-zinc-400">
              <Phone className="w-3.5 h-3.5" />
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 flex flex-col justify-end">
            <div className="text-center text-[9px] text-zinc-500 font-mono uppercase tracking-widest my-1">
              TODAY 8:42 PM
            </div>

            {/* Received Message Bubble */}
            <div className="flex flex-col items-start max-w-[80%]">
              <div className="bg-white/[0.08] border border-white/10 text-zinc-100 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed font-sans">
                {contextSnippet || "wait so you're actually going through with it? lol"}
              </div>
              <span className="text-[9px] text-zinc-500 font-mono mt-1 pl-1">8:42 PM</span>
            </div>

            {/* Sent Response Bubble (Selected Text) */}
            <div className="flex flex-col items-end self-end max-w-[85%]">
              <div
                className={`${getBubbleStyle()} text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed whitespace-pre-wrap break-words`}
              >
                {selectedText}
              </div>
              <span className="text-[9px] text-cyan-400 font-mono mt-1 pr-1">✓ Delivered</span>
            </div>
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-full px-3.5 py-1.5 text-zinc-400 font-mono text-[11px]">
              Ready to send...
            </div>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                copied ? "bg-emerald-400 text-black shadow-[0_0_15px_#10B981]" : "bg-white text-black hover:bg-zinc-200"
              }`}
              title="Copy this message"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-3.5 bg-white/[0.02] border-t border-white/10 flex justify-between items-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Ready to drop in chat</p>
          <button
            onClick={handleCopy}
            className="text-xs font-mono font-bold uppercase tracking-wider px-4 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            {copied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>
      </div>
    </div>
  );
};


