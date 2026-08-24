import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  ClipboardPaste,
  Check,
  Zap,
  Activity,
  Scan,
  Instagram,
  Flame,
  Heart,
  MessageCircle,
  MessageSquare,
  Ghost,
} from "lucide-react";
import { PresetChat } from "../types";
import { PRESET_CHATS } from "../data/presets";

interface ScreenshotUploaderProps {
  inputMode: "screenshot" | "text";
  setInputMode: (mode: "screenshot" | "text") => void;
  selectedImage: string | null;
  setSelectedImage: (img: string | null) => void;
  selectedMimeType: string;
  setSelectedMimeType: (mime: string) => void;
  chatText: string;
  setChatText: (text: string) => void;
  onSelectPreset: (preset: PresetChat) => void;
  isAnalyzing: boolean;
  analysisStep?: string;
  appOverride: string;
  setAppOverride: (app: string) => void;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  inputMode,
  setInputMode,
  selectedImage,
  setSelectedImage,
  selectedMimeType,
  setSelectedMimeType,
  chatText,
  setChatText,
  onSelectPreset,
  isAnalyzing,
  analysisStep = "Scanning screenshot & deciphering tone...",
  appOverride,
  setAppOverride,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(false);

  // Platform badges configuration
  const platforms = [
    { id: "auto", label: "Auto-Detect", icon: Zap, color: "from-cyan-500 to-blue-500", border: "border-cyan-500/40" },
    { id: "Instagram", label: "Instagram", icon: Instagram, color: "from-fuchsia-500 to-pink-500", border: "border-pink-500/40" },
    { id: "iMessage", label: "iMessage", icon: MessageCircle, color: "from-blue-500 to-cyan-400", border: "border-blue-500/40" },
    { id: "Tinder", label: "Tinder", icon: Flame, color: "from-rose-500 to-amber-500", border: "border-rose-500/40" },
    { id: "Hinge", label: "Hinge", icon: Heart, color: "from-zinc-200 to-zinc-400", border: "border-zinc-400/40" },
    { id: "Snapchat", label: "Snapchat", icon: Ghost, color: "from-yellow-400 to-amber-300", border: "border-yellow-400/40" },
    { id: "Bumble", label: "Bumble", icon: MessageSquare, color: "from-amber-400 to-yellow-500", border: "border-amber-400/40" },
  ];

  // Global clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isAnalyzing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            setPasteNotice(true);
            setTimeout(() => setPasteNotice(false), 2500);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isAnalyzing]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      
      // Fast client-side image downscaling to reduce payload from ~10MB to <100KB for ultra-fast API speed
      const img = new Image();
      img.onload = () => {
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setSelectedImage(compressedDataUrl);
          setSelectedMimeType("image/jpeg");
        } else {
          setSelectedImage(rawDataUrl);
          setSelectedMimeType(file.type);
        }
        setInputMode("screenshot");
      };
      img.onerror = () => {
        setSelectedImage(rawDataUrl);
        setSelectedMimeType(file.type);
        setInputMode("screenshot");
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Platform Badge Selectors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Scan className="w-3.5 h-3.5 text-cyan-400" />
            Target Platform Calibration
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Selected: <strong className="text-cyan-300 font-bold uppercase">{appOverride}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = appOverride === p.id;
            return (
              <button
                key={p.id}
                type="button"
                id={`platform-badge-${p.id}`}
                onClick={() => setAppOverride(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md ${
                  isSelected
                    ? `bg-gradient-to-r ${p.color} text-black font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105 border border-white/40`
                    : "bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-black" : "text-zinc-400"}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 backdrop-blur-xl">
          <button
            type="button"
            id="tab-screenshot-mode"
            onClick={() => setInputMode("screenshot")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              inputMode === "screenshot"
                ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload Screenshot</span>
          </button>
          <button
            type="button"
            id="tab-text-mode"
            onClick={() => setInputMode("text")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              inputMode === "text"
                ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Transcript</span>
          </button>
        </div>

        {/* Paste notification badge */}
        {pasteNotice && (
          <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-mono animate-in fade-in">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>PASTED FROM CLIPBOARD</span>
          </div>
        )}
      </div>

      {/* Screenshot Dropzone */}
      {inputMode === "screenshot" ? (
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              id="screenshot-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] backdrop-blur-xl overflow-hidden group ${
                isDragging
                  ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
                  : "border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
              }`}
            >
              {/* Background ambient neon glow orb */}
              <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-violet-600/10 to-cyan-500/10 blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

              {/* Pulsing neon-accented icon container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-300">
                <UploadCloud className="w-8 h-8 text-cyan-400 group-hover:text-emerald-300 transition-colors" />
              </div>

              <h3 className="text-base sm:text-lg font-black text-white uppercase font-mono tracking-wider mb-1.5 flex items-center gap-2">
                <span>Drop screenshot or</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 underline underline-offset-4 decoration-cyan-400">
                  click to upload
                </span>
              </h3>

              <p className="text-xs text-zinc-400 max-w-md mb-4 leading-relaxed font-sans">
                Supports Instagram DMs, Tinder, Hinge, Bumble, Snapchat, iMessage & WhatsApp conversations.
              </p>

              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-[11px] text-zinc-400 font-mono tracking-wider backdrop-blur-md">
                <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                <span>Shortcut: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Cmd+V</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Ctrl+V</kbd> anywhere</span>
              </div>
            </div>
          ) : (
            /* Image Preview & Futuristic Laser Scanning Simulation */
            <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/15 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 overflow-hidden shadow-2xl">
              {/* Image with laser scan effect */}
              <div className="relative max-h-72 sm:max-h-80 rounded-xl overflow-hidden border border-white/15 bg-black/80 flex items-center justify-center group shadow-inner">
                <img
                  src={selectedImage}
                  alt="Chat screenshot preview"
                  className="max-h-72 sm:max-h-80 object-contain rounded-lg"
                />

                {/* Laser Scanning Line Animation when analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06B6D4] animate-scan-laser z-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-violet-500/10 pointer-events-none z-10" />
                  </div>
                )}

                {/* Live Scanning HUD Badge */}
                {isAnalyzing && (
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/85 border border-cyan-500/50 backdrop-blur-md text-[10px] font-mono text-cyan-300 flex items-center gap-2 z-30">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                    <span className="truncate">{analysisStep}</span>
                  </div>
                )}
              </div>

              {/* Information & Actions */}
              <div className="flex-1 w-full flex flex-col justify-between py-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Screenshot Loaded & Vision Armed</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Gemini Vision AI is calibrated to analyze chat bubbles, timestamps, sender dynamics, and hidden conversational subtext.
                  </p>
                </div>

                {isAnalyzing && (
                  <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-cyan-500/20 backdrop-blur-md">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        Live Telemetry
                      </span>
                      <span className="text-emerald-400 font-bold">Processing</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 h-full w-3/4 animate-pulse rounded-full" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/15 hover:border-white/30 transition-all disabled:opacity-50"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    id="remove-screenshot-btn"
                    disabled={isAnalyzing}
                    onClick={() => {
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl bg-black/40 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Text Transcript Mode */
        <div className="space-y-2">
          <textarea
            id="chat-text-input"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            rows={6}
            placeholder={`Paste conversation or type transcript here...\n\nExample:\nThem: hey are you coming to the party tonight?\nMe: maybe what time does it start?\nThem: like 9ish u should come`}
            className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none font-sans backdrop-blur-xl transition-all"
          />
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>Include context like 'They posted a story' or 'Dry text after 3 days'</span>
            {chatText && (
              <button
                type="button"
                onClick={() => setChatText("")}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Clear text
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preset Scenarios Carousel */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06B6D4]"></span>
            Test with authentic scenario presets:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_CHATS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              id={`preset-${preset.id}`}
              disabled={isAnalyzing}
              onClick={() => onSelectPreset(preset)}
              className="text-left p-3.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-400/50 transition-all duration-200 group flex flex-col justify-between backdrop-blur-md hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] disabled:opacity-50"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate font-mono">
                  {preset.title}
                </span>
                <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/10 group-hover:border-cyan-400/30 group-hover:text-cyan-300 shrink-0">
                  {preset.app}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1 italic group-hover:text-zinc-200">
                "{preset.previewSnippet}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


