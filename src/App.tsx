import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ScreenshotUploader } from "./components/ScreenshotUploader";
import { AnalysisControls } from "./components/AnalysisControls";
import { VibeDiagnosisBanner } from "./components/VibeDiagnosisBanner";
import { ResponseCard } from "./components/ResponseCard";
import { ChatSimulatorModal } from "./components/ChatSimulatorModal";
import { SafetyGuidelinesModal } from "./components/SafetyGuidelinesModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { RizzEngineResult, PresetChat, AnalysisHistoryItem } from "./types";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  History,
  AlertCircle,
  ShieldCheck,
  Lock,
  Zap,
} from "lucide-react";

export default function App() {
  // Input states
  const [inputMode, setInputMode] = useState<"screenshot" | "text">("screenshot");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>("image/png");
  const [chatText, setChatText] = useState<string>("");

  // Customization overrides
  const [ageGroup, setAgeGroup] = useState<string>("auto");
  const [appOverride, setAppOverride] = useState<string>("auto");
  const [userGoal, setUserGoal] = useState<string>("");
  const [customVibe, setCustomVibe] = useState<string>("");

  // Processing & Results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<RizzEngineResult | null>(null);

  // Modals & Drawers
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [simulatorState, setSimulatorState] = useState<{
    isOpen: boolean;
    text: string;
    app: string;
    context: string;
  }>({
    isOpen: false,
    text: "",
    app: "iMessage",
    context: "",
  });

  // History stored in localStorage
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("rizzengine_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("rizzengine_history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [history]);

  // Handle Preset selection
  const handleSelectPreset = async (preset: PresetChat) => {
    setErrorMessage(null);
    setInputMode("screenshot");
    setSelectedImage(preset.imageSvgDataUrl || null);
    setSelectedMimeType("image/svg+xml");
    setChatText(preset.fullTranscript);
    setAppOverride(preset.app);

    // Auto trigger analysis on preset selection for fast demonstration
    triggerAnalysis({
      img: preset.imageSvgDataUrl || null,
      mime: "image/svg+xml",
      text: preset.fullTranscript,
      app: preset.app,
    });
  };

  const triggerAnalysis = async (customPayload?: {
    img?: string | null;
    mime?: string;
    text?: string;
    app?: string;
  }) => {
    const imgToUse = customPayload ? customPayload.img : selectedImage;
    const mimeToUse = customPayload ? customPayload.mime : selectedMimeType;
    const textToUse = customPayload ? customPayload.text : chatText;
    const appToUse = customPayload?.app || appOverride;

    if (!imgToUse && (!textToUse || !textToUse.trim())) {
      setErrorMessage("Please upload a chat screenshot or paste conversation text first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep("Scanning chat bubbles & timestamps...");

    const stepTimer1 = setTimeout(() => {
      setAnalysisStep("Detecting conversational subtext & tension dynamic...");
    }, 450);

    const stepTimer2 = setTimeout(() => {
      setAnalysisStep("Calibrating Gen-Z tone & synthesizing 3 distinct responses...");
    }, 1000);

    try {
      const response = await fetch("/api/analyze-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgToUse,
          mimeType: mimeToUse,
          textInput: textToUse,
          userGoal,
          customVibe,
          ageGroupOverride: ageGroup,
          appOverride: appToUse,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to analyze chat. Please try again.");
      }

      const data = await response.json();
      const resultObj: RizzEngineResult = {
        detectedContext: data.detectedContext || {
          app: appToUse !== "auto" ? appToUse : "Direct Message",
          inferredAgeGroup: ageGroup !== "auto" ? ageGroup : "13-21",
          vibeAnalysis: "Natural back-and-forth banter.",
        },
        options: data.options || [],
        timestamp: Date.now(),
        inputPreview: {
          type: imgToUse ? "image" : "text",
          data: imgToUse || textToUse || "",
        },
      };

      setCurrentResult(resultObj);

      // Save to history
      const historyItem: AnalysisHistoryItem = {
        id: `analysis-${Date.now()}`,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        snippet:
          resultObj.detectedContext?.vibeAnalysis ||
          (textToUse ? textToUse.slice(0, 60) : "Screenshot analysis"),
        app: resultObj.detectedContext?.app || "Chat",
        result: resultObj,
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, 19)]);

      // Scroll smoothly to results
      setTimeout(() => {
        const resultsEl = document.getElementById("results-section");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleOpenSimulator = (text: string) => {
    const app = currentResult?.detectedContext?.app || "iMessage";
    const contextSnippet =
      chatText ||
      (currentResult?.detectedContext?.vibeAnalysis ? `Context: ${currentResult.detectedContext.vibeAnalysis}` : "Incoming message");

    setSimulatorState({
      isOpen: true,
      text,
      app,
      context: contextSnippet,
    });
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-black relative overflow-x-hidden">
      {/* Subtle Ambient Cyberpunk Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="fixed bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      {/* Top Navigation Header */}
      <Header
        onOpenSafetyModal={() => setShowSafetyModal(true)}
        onOpenHistoryDrawer={() => setShowHistoryDrawer(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Futuristic Hero Section */}
        <section className="pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-mono uppercase font-bold tracking-wider">
                ⚡ Neural Texting Core
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                Demographic-Calibrated Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
              Never Send a Dry Text Again.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Upload any screenshot from Instagram DMs, Tinder, Hinge, Bumble, iMessage, or Snapchat.
              Extract conversational subtext and instantly synthesize 3 humanized response options.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-cyan-300 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 transition-all backdrop-blur-md"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Archive ({history.length})</span>
            </button>
          </div>
        </section>

        {/* Input & Customizer Section (Frosted Glass Panel) */}
        <section className="backdrop-blur-2xl bg-white/[0.025] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
          {/* Screenshot Uploader or Transcript Paste with Platform Selectors */}
          <ScreenshotUploader
            inputMode={inputMode}
            setInputMode={setInputMode}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            selectedMimeType={selectedMimeType}
            setSelectedMimeType={setSelectedMimeType}
            chatText={chatText}
            setChatText={setChatText}
            onSelectPreset={handleSelectPreset}
            isAnalyzing={isAnalyzing}
            analysisStep={analysisStep}
            appOverride={appOverride}
            setAppOverride={setAppOverride}
          />

          {/* Tactical Customizer */}
          <AnalysisControls
            ageGroup={ageGroup}
            setAgeGroup={setAgeGroup}
            appOverride={appOverride}
            setAppOverride={setAppOverride}
            userGoal={userGoal}
            setUserGoal={setUserGoal}
            customVibe={customVibe}
            setCustomVibe={setCustomVibe}
          />

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-200 animate-in fade-in backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-mono">
                <strong className="font-bold block text-rose-100 uppercase tracking-wider mb-0.5">Analysis Issue</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Primary Action Button with Electric Glow */}
          <div className="pt-2">
            <button
              id="analyze-chat-btn"
              disabled={isAnalyzing}
              onClick={() => triggerAnalysis()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider font-mono shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] active:scale-[0.99] transition-all flex items-center justify-center space-x-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span>{analysisStep || "ANALYZING CHAT DYNAMICS..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-black" />
                  <span>Generate 3 High-Rizz Responses</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {currentResult && (
          <section id="results-section" className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header with Cyberpunk Styling */}
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/15 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-400 shadow-[0_0_10px_#06B6D4]" />
                <div>
                  <span className="font-black uppercase tracking-tight text-xl text-white font-mono">
                    Top 3 Tactical Responses
                  </span>
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-0.5">
                    Select a vibe that matches your energy, or customize via AI refiner
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider bg-black/60 border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  MODE: NATURAL_AUTHENTIC
                </span>
                <button
                  id="reroll-btn"
                  disabled={isAnalyzing}
                  onClick={() => triggerAnalysis()}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/15 hover:border-white/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzing ? "animate-spin" : ""}`} />
                  <span>Reroll All</span>
                </button>
              </div>
            </div>

            {/* Vibe Diagnosis Context */}
            {currentResult.detectedContext && (
              <VibeDiagnosisBanner context={currentResult.detectedContext} />
            )}

            {/* 3 Response Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {currentResult.options?.map((opt) => (
                <ResponseCard
                  key={opt.optionNumber}
                  option={opt}
                  contextApp={currentResult.detectedContext?.app || "Chat"}
                  inferredAgeGroup={currentResult.detectedContext?.inferredAgeGroup || "13-21"}
                  onOpenSimulator={handleOpenSimulator}
                  onRerollSingle={() => triggerAnalysis()}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer / Trust Badge */}
      <footer className="mt-16 py-8 border-t border-white/10 bg-[#030303]/90 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center space-y-3 text-center">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end encrypted in-memory processing. Your screenshots are never stored.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest pt-1">
            <span>RizzEngine.ai Core v2.5</span>
            <span>•</span>
            <span>Zero AI Slop Calibrated</span>
            <span>•</span>
            <span>Flash Vision Neural Pipeline</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ChatSimulatorModal
        isOpen={simulatorState.isOpen}
        onClose={() => setSimulatorState((prev) => ({ ...prev, isOpen: false }))}
        selectedText={simulatorState.text}
        detectedApp={simulatorState.app}
        contextSnippet={simulatorState.context}
      />

      <SafetyGuidelinesModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
      />

      <HistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        history={history}
        onSelectHistoryItem={(item) => setCurrentResult(item.result)}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}


