import React from "react";
import { X, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2, Lock } from "lucide-react";

interface SafetyGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#070709] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Core Protocol v2.5</span>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white font-mono">PG-13 Safety & Style Standards</h3>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-zinc-200">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase font-mono tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Strict PG-13 & Harassment-Free Guardrails</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              All suggested replies are strictly filtered for respectful, authentic banter. Zero vulgar, creepy, sexually explicit, or non-consensual messaging is ever generated.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Natural Human Texting Cadence</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              No stiff essays or robotic AI clichés. Generated texts mirror actual smartphone habits: relaxed lowercase typography, natural phrasing, snappy punchlines, and zero try-hard energy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 shadow-sm">
            <div className="flex items-center space-x-2 text-violet-400 font-bold text-xs uppercase font-mono tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Genuine Connection Over Canned Pickups</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              We focus on active listening, identifying conversational callback hooks, playful teasing, and effortless transitions toward meeting in real life.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-mono font-black uppercase tracking-wider text-xs hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};


