import React, { useState } from "react";
import { RizzOption } from "../types";
import {
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  Wand2,
  RotateCcw,
  Sliders,
  Send,
  Loader2,
  RefreshCw,
  CaseLower,
  ShieldAlert,
} from "lucide-react";

interface ResponseCardProps {
  option: RizzOption;
  contextApp: string;
  inferredAgeGroup: string;
  onOpenSimulator: (text: string) => void;
  onTextModified?: (optionNumber: number, newText: string) => void;
  onRerollSingle?: (optionNumber: number) => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  option,
  contextApp,
  inferredAgeGroup,
  onOpenSimulator,
  onTextModified,
  onRerollSingle,
}) => {
  const [currentText, setCurrentText] = useState(option.text);
  const [copied, setCopied] = useState(false);
  const [showTweaker, setShowTweaker] = useState(false);
  const [tweakCustomInput, setTweakCustomInput] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);
  const [isLowercased, setIsLowercased] = useState(false);
  const [tweakExplanation, setTweakExplanation] = useState<string | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    setCurrentText(option.text);
    setTweakExplanation(null);
    setIsLowercased(false);
  }, [option.text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const toggleLowercase = () => {
    if (isLowercased) {
      setCurrentText(option.text);
      setIsLowercased(false);
    } else {
      const lower = currentText.toLowerCase().replace(/[.]$/, "");
      setCurrentText(lower);
      setIsLowercased(true);
    }
  };

  const handleApplyTweak = async (tweakPrompt: string) => {
    if (!tweakPrompt.trim() || isTweaking) return;
    setIsTweaking(true);
    setTweakExplanation(null);

    try {
      const response = await fetch("/api/tweak-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: currentText,
          tweakInstruction: tweakPrompt,
          contextApp,
          ageGroup: inferredAgeGroup,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to tweak text");
      }

      const data = await response.json();
      if (data.tweakedText) {
        setCurrentText(data.tweakedText);
        if (data.explanation) {
          setTweakExplanation(data.explanation);
        }
        if (onTextModified) {
          onTextModified(option.optionNumber, data.tweakedText);
        }
      }
    } catch (err) {
      console.error("Tweak error:", err);
    } finally {
      setIsTweaking(false);
      setTweakCustomInput("");
    }
  };

  const handleResetOriginal = () => {
    setCurrentText(option.text);
    setTweakExplanation(null);
    setIsLowercased(false);
    if (onTextModified) {
      onTextModified(option.optionNumber, option.text);
    }
  };

  const formattedNumber = String(option.optionNumber).padStart(2, "0");

  // Category Theme Config for luxury cyberpunk / Apple glass aesthetics
  const getCategoryConfig = (category: string, optNum: number) => {
    const cat = category.toUpperCase();
    if (cat.includes("SAFE") || optNum === 1) {
      return {
        icon: "🟢",
        badgeClass: "bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]",
        borderClass: "border-emerald-500/30 hover:border-emerald-400 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
        accentColor: "text-emerald-400",
        label: "SAFE & CASUAL",
      };
    }
    if (cat.includes("CREATIVE") || cat.includes("FUNNY") || optNum === 2) {
      return {
        icon: "⚡",
        badgeClass: "bg-gradient-to-r from-violet-400 to-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)]",
        borderClass: "border-cyan-500/30 hover:border-cyan-400 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
        accentColor: "text-cyan-400",
        label: "CREATIVE / FUNNY",
      };
    }
    return {
      icon: "🎯",
      badgeClass: "bg-gradient-to-r from-rose-400 to-amber-400 text-black shadow-[0_0_12px_rgba(244,63,94,0.5)]",
      borderClass: "border-fuchsia-500/30 hover:border-fuchsia-400 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
      accentColor: "text-rose-400",
      label: "BOLD / GOAL",
    };
  };

  const config = getCategoryConfig(option.category, option.optionNumber);

  return (
    <div
      id={`rizz-option-card-${option.optionNumber}`}
      className={`group relative backdrop-blur-xl bg-white/[0.025] hover:bg-white/[0.05] border ${config.borderClass} rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-2xl overflow-hidden`}
    >
      {/* Subtle background gradient tint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

      <div>
        {/* Top bar with ghost number, category badge, and quick actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <span className={`font-black text-2xl font-mono tracking-tighter ${config.accentColor} opacity-70`}>
              #{formattedNumber}
            </span>
            <span
              className={`${config.badgeClass} text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono tracking-wider flex items-center gap-1`}
            >
              <span>{config.icon}</span>
              <span>{option.category || config.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10 backdrop-blur-md">
            {/* Lowercase switch */}
            <button
              onClick={toggleLowercase}
              className={`p-1.5 rounded text-xs transition-colors ${
                isLowercased ? "bg-white/20 text-cyan-300 font-bold" : "text-zinc-400 hover:text-white"
              }`}
              title="Toggle relaxed lowercase aesthetic"
            >
              <CaseLower className="w-3.5 h-3.5" />
            </button>

            {/* Preview inside phone bubble */}
            <button
              id={`open-sim-btn-${option.optionNumber}`}
              onClick={() => onOpenSimulator(currentText)}
              className="p-1.5 rounded text-zinc-400 hover:text-cyan-400 transition-colors"
              title="Preview inside iOS / Android bubble simulator"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>

            {/* Single reroll button */}
            {onRerollSingle && (
              <button
                onClick={() => onRerollSingle(option.optionNumber)}
                className="p-1.5 rounded text-zinc-400 hover:text-emerald-400 transition-colors"
                title="Regenerate this specific reply"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* The Text Itself (High Readability Modern Display Style) */}
        <div className="relative my-2 p-3.5 rounded-xl bg-black/30 border border-white/5 backdrop-blur-sm group-hover:border-white/15 transition-colors">
          <p className="text-lg sm:text-xl font-medium text-white tracking-tight leading-relaxed select-all font-sans">
            "{currentText}"
          </p>
        </div>

        {/* Strategy Description Pill */}
        <div className="mt-3 mb-4 flex items-start gap-1.5 text-[11px] text-zinc-400 font-mono leading-relaxed">
          <span className="text-cyan-400 font-bold shrink-0">Strategy:</span>
          <span>{option.strategy}</span>
        </div>

        {tweakExplanation && (
          <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center space-x-2 text-xs text-cyan-300 font-mono animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span>Tweak: {tweakExplanation}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="space-y-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          {/* Instant Copy to Clipboard Button with micro-animation */}
          <button
            id={`copy-btn-${option.optionNumber}`}
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] font-mono shadow-lg cursor-pointer ${
              copied
                ? "bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3] text-black animate-in zoom-in-50 duration-150" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          {/* AI Fine-Tuner toggle button */}
          <button
            id={`toggle-tweak-btn-${option.optionNumber}`}
            onClick={() => setShowTweaker(!showTweaker)}
            className={`flex items-center space-x-1.5 px-3.5 py-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              showTweaker
                ? "bg-white/[0.1] text-cyan-400 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white hover:border-white/30"
            }`}
            title="Fine-tune / tweak this reply"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tweak</span>
          </button>
        </div>

        {/* AI Tweak Drawer */}
        {showTweaker && (
          <div className="bg-black/80 border border-white/15 rounded-xl p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3 h-3" />
                Neural Tone Tweaker
              </span>
              {currentText !== option.text && (
                <button
                  onClick={handleResetOriginal}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reset
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "⚡ Shorter", prompt: "make it shorter, snappier, and punchier" },
                { label: "🧊 More dry", prompt: "make it more nonchalant, cool, and dry humor" },
                { label: "😏 Tease more", prompt: "add a subtle playful banter tease" },
                { label: "☕ Invite to hang", prompt: "naturally pivot to meeting up or grabbing coffee" },
                { label: "📱 Lowercase", prompt: "format in relaxed all-lowercase texting aesthetic" },
              ].map((pill, idx) => (
                <button
                  key={idx}
                  disabled={isTweaking}
                  onClick={() => handleApplyTweak(pill.prompt)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-cyan-400/60 text-zinc-300 hover:text-white disabled:opacity-50 transition-all hover:bg-white/[0.08]"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={tweakCustomInput}
                onChange={(e) => setTweakCustomInput(e.target.value)}
                placeholder="Type custom tweak (e.g. sound more witty)..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyTweak(tweakCustomInput);
                }}
                disabled={isTweaking}
                className="flex-1 bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
              />
              <button
                disabled={!tweakCustomInput.trim() || isTweaking}
                onClick={() => handleApplyTweak(tweakCustomInput)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 disabled:opacity-50 text-black text-xs font-bold font-mono flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                {isTweaking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


