import React from "react";
import { SlidersHorizontal, Target, Smile, Smartphone, Users } from "lucide-react";

interface AnalysisControlsProps {
  ageGroup: string;
  setAgeGroup: (val: string) => void;
  appOverride: string;
  setAppOverride: (val: string) => void;
  userGoal: string;
  setUserGoal: (val: string) => void;
  customVibe: string;
  setCustomVibe: (val: string) => void;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  ageGroup,
  setAgeGroup,
  appOverride,
  setAppOverride,
  userGoal,
  setUserGoal,
  customVibe,
  setCustomVibe,
}) => {
  const goalPresets = [
    { label: "Keep it flowing", val: "Keep conversation natural and flowing smoothly" },
    { label: "Playful tease", val: "Lightly tease them or make a witty inside joke" },
    { label: "Ask for coffee/meet", val: "Naturally transition toward grabbing coffee, boba, or hanging out" },
    { label: "Get IG / number", val: "Switch over to Instagram or get phone number smoothly" },
    { label: "Revive dead chat", val: "Re-ignite interest after a dry or slow reply" },
    { label: "Play it nonchalant", val: "Cool, unbothered, zero-pressure vibe" },
  ];

  const vibePresets = [
    "Chill & Nonchalant",
    "Witty & Teasing",
    "Smooth & Charming",
    "Dry / Relatable Humor",
    "Direct & Confident",
  ];

  return (
    <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Tactical Tuning & Goal Calibration
        </span>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          AI Auto-Calibrated by default
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Age Bracket Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-cyan-400" />
            Audience Demographic Bias
          </label>
          <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
            {[
              { id: "auto", label: "Auto-Tune" },
              { id: "13-21", label: "13–21 (Gen Z)" },
              { id: "22-30", label: "22–30 (Young Adult)" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAgeGroup(opt.id)}
                className={`py-2 text-[11px] font-mono uppercase tracking-wider rounded-lg transition-all ${
                  ageGroup === opt.id
                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Smartphone className="w-3 h-3 text-cyan-400" />
            Platform Target Environment
          </label>
          <select
            value={appOverride}
            onChange={(e) => setAppOverride(e.target.value)}
            className="w-full bg-black/60 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
          >
            <option value="auto">Auto-Detect from Screenshot</option>
            <option value="Instagram">Instagram DMs</option>
            <option value="Tinder">Tinder</option>
            <option value="Hinge">Hinge</option>
            <option value="Bumble">Bumble</option>
            <option value="iMessage">iMessage / SMS</option>
            <option value="Snapchat">Snapchat</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Goal Selector */}
      <div className="space-y-2.5 pt-1 border-t border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-cyan-400" />
            Specific Tactical Mission
          </label>
          {userGoal && (
            <button
              onClick={() => setUserGoal("")}
              className="text-[10px] font-mono uppercase text-zinc-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {goalPresets.map((g, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUserGoal(userGoal === g.val ? "" : g.val)}
              className={`text-[11px] font-mono uppercase px-3 py-1.5 rounded-lg border transition-all ${
                userGoal === g.val
                  ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black border-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desired Vibe */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Smile className="w-3 h-3 text-cyan-400" />
            Tone & Chemistry Bias
          </label>
          {customVibe && (
            <button
              onClick={() => setCustomVibe("")}
              className="text-[10px] font-mono uppercase text-zinc-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {vibePresets.map((v, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCustomVibe(customVibe === v ? "" : v)}
              className={`text-[11px] font-mono uppercase px-3 py-1.5 rounded-lg border transition-all ${
                customVibe === v
                  ? "bg-white text-black border-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


