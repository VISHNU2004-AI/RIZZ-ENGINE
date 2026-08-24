import React from "react";
import { DetectedContext } from "../types";
import { Sparkles, Radio, Activity, Eye, Zap } from "lucide-react";

interface VibeDiagnosisBannerProps {
  context: DetectedContext;
}

export const VibeDiagnosisBanner: React.FC<VibeDiagnosisBannerProps> = ({ context }) => {
  const isGenZ = context.inferredAgeGroup.includes("13");

  return (
    <div className="w-full backdrop-blur-2xl bg-white/[0.03] border border-white/15 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#06B6D4]"></span>
          </span>
          <span className="text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Detected Context & Conversational Subtext
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
            DIAGNOSTIC_v2.5
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Vibe Statement */}
        <div className="md:col-span-8 space-y-1.5">
          <label className="block text-[10px] text-zinc-400 uppercase font-bold tracking-widest font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            Vibe Check & Subtext
          </label>
          <p className="text-base sm:text-xl font-medium text-white leading-relaxed italic bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            "{context.vibeAnalysis}"
          </p>
        </div>

        {/* Platform & Audience Blocks */}
        <div className="md:col-span-4 flex md:flex-col gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div>
            <label className="block text-[10px] text-zinc-400 uppercase font-bold tracking-widest font-mono mb-1">
              Detected Platform
            </label>
            <p className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {context.app}
            </p>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 uppercase font-bold tracking-widest font-mono mb-1">
              Calibrated Demographic
            </label>
            <p className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {isGenZ ? "Gen Z (13–21) Authentic" : "Young Adult (22–30) Polish"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


