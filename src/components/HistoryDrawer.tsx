import React from "react";
import { History, X, Trash2, ArrowRight, Smartphone, Calendar, Sparkles } from "lucide-react";
import { AnalysisHistoryItem } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (item: AnalysisHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#070709] border-l border-white/15 h-full p-6 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <History className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">Vault & Logs</span>
                <h3 className="text-sm font-bold uppercase font-mono text-white">Recent Analyses</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* History List */}
          <div className="py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-170px)] pr-1">
            {history.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs font-mono">
                No recent chat analyses in session memory.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all space-y-2 group shadow-lg"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5 font-bold text-white uppercase">
                      <Smartphone className="w-3 h-3 text-cyan-400" />
                      {item.app || "Chat"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {item.date}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 line-clamp-2 font-medium italic">
                    "{item.result.detectedContext?.vibeAnalysis || item.snippet}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 group-hover:text-cyan-400 font-bold transition-colors">
                    <span>{item.result.options?.length || 3} options ready</span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      Restore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <button
              onClick={onClearHistory}
              className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Archive
            </button>
            <button
              onClick={onClose}
              className="text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-md"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


