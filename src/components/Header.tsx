import React from "react";
import { ShieldCheck, Sparkles, Zap, History, Cpu } from "lucide-react";

interface HeaderProps {
  onOpenSafetyModal: () => void;
  onOpenHistoryDrawer?: () => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSafetyModal,
  onOpenHistoryDrawer,
  historyCount = 0,
}) => {
  return (
    <header className="w-full border-b border-white/[0.08] bg-[#030303]/80 backdrop-blur-2xl sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Futuristic Brand Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-emerald-500/20 border border-white/15 backdrop-blur-xl shadow-[0_0_20px_rgba(139,92,246,0.15)] group">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                RizzEngine<span className="text-cyan-400">.ai</span>
              </span>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-violet-400/90 hidden sm:inline">
                v2.5
              </span>
            </div>
          </div>

          {/* Live System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/30 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Neural Core Active
            </span>
          </div>
        </div>

        {/* Right side status / credit counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenHistoryDrawer && (
            <button
              id="header-history-btn"
              onClick={onOpenHistoryDrawer}
              className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono"
              title="View saved replies archive"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Archive</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          <button
            id="pg13-safety-btn"
            onClick={onOpenSafetyModal}
            className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono"
            title="Safety & Respect Safeguards"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] hidden sm:inline">PG-13 Guard</span>
          </button>

          {/* Credit counter pill */}
          <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-950/50 to-indigo-950/50 border border-violet-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-xs font-mono font-bold text-violet-200 tracking-wider">
              ⚡ UNLIMITED
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


