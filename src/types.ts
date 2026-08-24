export interface DetectedContext {
  app: string;
  inferredAgeGroup: string; // "13-21" | "22-30" | string
  vibeAnalysis: string;
}

export interface RizzOption {
  optionNumber: number;
  category: "SAFE & CASUAL" | "CREATIVE / FUNNY" | "BOLD / GOAL-ORIENTED" | string;
  strategy: string;
  text: string;
}

export interface RizzEngineResult {
  detectedContext: DetectedContext;
  options: RizzOption[];
  timestamp?: number;
  inputPreview?: {
    type: "image" | "text";
    data: string; // base64 or text snippet
    title?: string;
  };
}

export interface PresetChat {
  id: string;
  title: string;
  app: string;
  badge: string;
  previewSnippet: string;
  fullTranscript: string;
  contextDesc: string;
  imageSvgDataUrl?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  snippet: string;
  app: string;
  result: RizzEngineResult;
}
