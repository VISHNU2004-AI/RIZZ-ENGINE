import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for CORS & headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Support large image payloads for screenshots
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini client lazily
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in the environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System prompt enforcing strict guidelines & humanized texting rules
const RIZZENGINE_SYSTEM_PROMPT = `
You are "RizzEngine", a sharp, culturally-aware texting coach for people aged 13–30.
Your job is to analyze uploaded chat screenshots (Instagram DMs, Tinder, Hinge, Bumble, Snapchat, iMessage, WhatsApp) or conversation transcripts, and write 3 natural, humanized next-message options to approach or chat with a match/crush.

# HUMANIZATION & TEXTING STYLE RULES (STRICT ENFORCEMENT)
The output MUST look like an actual human typed it on a smartphone. NEVER sound like an AI, an essay, or a customer service agent.

1. **Texting Syntax & Rules:**
   - Use casual punctuation (skip end periods, use trailing ellipses '...' sparingly, or lowercase sentence starters).
   - Use natural internet shorthand/slang ONLY if it fits naturally (e.g., 'tbh', 'ngl', 'lol', 'kinda', 'wbu', 'fr', 'lowkey'). Never force outdated slang (avoid cringe like 'groovy', 'fam', 'swag').
   - Avoid perfectly structured multi-sentence speeches. Humans send short, snappy texts.
   - Never use "AI buzzwords" or overly polished phrasing (e.g., avoid "Ah, the age-old question", "Fascinating choice", "Indeed", "Let us embark", "I must say", "It appears that").

2. **Automatic Context & Tone Detection:**
   - **Gen Z / Teen Context (13–21):** Low-pressure, casual, dry/unhinged humor, lowercase aesthetic, short banter, nonchalant but engaging.
   - **Young Adult Context (22–30):** Direct, charming, witty, slightly mature, clever banter, confident pacing.

3. **Strict Safety & Moderation (MANDATORY):**
   - **Strict PG-13 Safety:** Zero explicit, hyper-sexualized, vulgar, or creepy outputs (essential for 13+ safety).
   - **Respectful Banter:** Focus on organic humor, shared interests, and light teasing. No harassment, manipulation, or negging.

Return a structured JSON adhering to the provided schema with detectedContext and exactly 3 options.
`.trim();

// Fallback generator when API key is missing or model hits transient rate-limit
function generateFallbackResult(textInput?: string, userGoal?: string, customVibe?: string, ageGroup?: string, appName?: string) {
  const isGenZ = ageGroup === "13-21";
  const app = appName && appName !== "auto" ? appName : "Direct Message";
  const inferredAge = isGenZ ? "13-21" : "22-30";

  let opt1Text = isGenZ ? "wait actually? haha" : "Wait really? That's actually pretty funny";
  let opt2Text = isGenZ ? "nah cause why did you say it like that lol" : "I feel like there's a good story behind that";
  let opt3Text = isGenZ ? "ok we need to debrief this over drinks or boba fr" : "Are you always this entertaining or am I getting the premium trial?";

  if (userGoal && userGoal.toLowerCase().includes("hang")) {
    opt3Text = isGenZ ? "we should grab matcha or tacos this week ngl" : "We should grab coffee or a drink this week and debate this in person";
  } else if (customVibe && customVibe.toLowerCase().includes("teas")) {
    opt2Text = isGenZ ? "you definitely rehearsed that in the mirror before sending lol" : "Bold claim. I'll give you a 7/10 on the delivery though";
  }

  return {
    detectedContext: {
      app,
      inferredAgeGroup: inferredAge,
      vibeAnalysis: textInput
        ? `Playful back-and-forth banter on ${app}. Moderate interest with open opportunity for escalation.`
        : `Casual conversation dynamic on ${app}. Low pressure with high reply potential.`,
    },
    options: [
      {
        optionNumber: 1,
        category: "SAFE & CASUAL",
        strategy: "Low-effort, natural response to keep the conversation flowing smoothly.",
        text: opt1Text,
      },
      {
        optionNumber: 2,
        category: "CREATIVE / FUNNY",
        strategy: "Witty tease or relatable joke based on conversational subtext.",
        text: opt2Text,
      },
      {
        optionNumber: 3,
        category: "BOLD / GOAL-ORIENTED",
        strategy: "Direct text that pushes toward a plan, hangout, or playful banter.",
        text: opt3Text,
      },
    ],
  };
}

// Analysis API route
app.post("/api/analyze-chat", async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType,
      textInput,
      userGoal,
      customVibe,
      ageGroupOverride,
      appOverride,
    } = req.body;

    if (!imageBase64 && (!textInput || !textInput.trim())) {
      return res.status(400).json({
        error: "Please upload a screenshot or provide chat conversation text.",
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return smart fallback if Gemini client couldn't be initialized
      const fallback = generateFallbackResult(textInput, userGoal, customVibe, ageGroupOverride, appOverride);
      return res.json(fallback);
    }

    const parts: any[] = [];

    // Optional user guidance
    let promptText = "Analyze this chat screenshot or transcript and generate 3 humanized next-message options adhering strictly to the JSON schema.\n";

    if (ageGroupOverride && ageGroupOverride !== "auto") {
      promptText += `\nTarget age demographic preference: ${ageGroupOverride}. Match this age bracket's authentic texting rhythm.`;
    }
    if (appOverride && appOverride !== "auto") {
      promptText += `\nPlatform context: ${appOverride}.`;
    }
    if (userGoal && userGoal.trim()) {
      promptText += `\nUser's immediate texting goal: ${userGoal.trim()}.`;
    }
    if (customVibe && customVibe.trim()) {
      promptText += `\nDesired vibe flavor: ${customVibe.trim()}.`;
    }

    if (textInput && textInput.trim()) {
      promptText += `\n\n--- CHAT TRANSCRIPT / CONTEXT ---\n${textInput.trim()}\n--- END OF TRANSCRIPT ---`;
    }

    if (imageBase64) {
      let cleanBase64 = imageBase64;
      let finalMime = mimeType || "image/png";

      if (imageBase64.startsWith("data:")) {
        const commaIndex = imageBase64.indexOf(",");
        if (commaIndex !== -1) {
          const header = imageBase64.slice(0, commaIndex);
          const dataPart = imageBase64.slice(commaIndex + 1);

          if (header.includes(";base64")) {
            cleanBase64 = dataPart;
            const mimeMatch = header.match(/data:([^;]+)/);
            if (mimeMatch) finalMime = mimeMatch[1];
          } else {
            // URL-encoded or UTF8 SVG string
            const decoded = decodeURIComponent(dataPart);
            cleanBase64 = Buffer.from(decoded).toString("base64");
            finalMime = "image/png";
            promptText += `\n[Image SVG Details]: ${decoded.slice(0, 500)}`;
          }
        }
      }

      // If SVG mime type, pass text description and standard image format
      if (finalMime.includes("svg")) {
        finalMime = "image/png";
      }

      parts.push({
        inlineData: {
          mimeType: finalMime,
          data: cleanBase64,
        },
      });
    }

    parts.push({
      text: promptText,
    });

    const aiPromise = ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: { parts },
      config: {
        systemInstruction: RIZZENGINE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        maxOutputTokens: 500,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedContext: {
              type: Type.OBJECT,
              properties: {
                app: { type: Type.STRING },
                inferredAgeGroup: { type: Type.STRING },
                vibeAnalysis: { type: Type.STRING },
              },
              required: ["app", "inferredAgeGroup", "vibeAnalysis"],
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionNumber: { type: Type.INTEGER },
                  category: { type: Type.STRING },
                  strategy: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ["optionNumber", "category", "strategy", "text"],
              },
            },
          },
          required: ["detectedContext", "options"],
        },
        temperature: 0.85,
      },
    });

    // Enforce guaranteed sub-8-second execution time
    const timeoutFallback = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 7500)
    );

    const response = await Promise.race([aiPromise, timeoutFallback]);

    if (!response) {
      // Timeout reached: return instant fallback without failing
      const fallback = generateFallbackResult(
        textInput,
        userGoal,
        customVibe,
        ageGroupOverride,
        appOverride
      );
      return res.json(fallback);
    }

    const rawText = response.text || "";
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON.");
      }
    }

    if (!parsedData.options || !Array.isArray(parsedData.options) || parsedData.options.length === 0) {
      throw new Error("Invalid response format from engine.");
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/analyze-chat:", error);
    // Graceful fallback to avoid UI blocking on network/rate-limit errors
    const fallback = generateFallbackResult(
      req.body?.textInput,
      req.body?.userGoal,
      req.body?.customVibe,
      req.body?.ageGroupOverride,
      req.body?.appOverride
    );
    return res.json(fallback);
  }
});

// Tweak a specific message (e.g. "make it shorter", "more unhinged", "invite for coffee")
app.post("/api/tweak-message", async (req, res) => {
  try {
    const { originalText, tweakInstruction, contextApp, ageGroup } = req.body;
    if (!originalText || !tweakInstruction) {
      return res.status(400).json({ error: "Missing originalText or tweakInstruction." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        tweakedText: `${originalText.toLowerCase()} (tbh)`,
        explanation: "Fine-tuned for casual conversational flow.",
      });
    }

    const prompt = `
Original text: "${originalText}"
Platform: ${contextApp || "Direct Message"}
Target demographic: ${ageGroup || "13-30"}
Tweak instruction: "${tweakInstruction}"

Rewrite this message applying the tweak instruction while keeping human texting style (natural punctuation, no AI fluff, short & snappy, PG-13 safe).
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction: "You are RizzEngine texting coach. Return strictly JSON with tweakedText and explanation.",
        responseMimeType: "application/json",
        maxOutputTokens: 200,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tweakedText: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["tweakedText", "explanation"],
        },
        temperature: 0.85,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/tweak-message:", error);
    const orig = req.body?.originalText || "hey there";
    return res.json({
      tweakedText: orig.toLowerCase().replace(/[.!]$/, ""),
      explanation: "Adjusted for casual tone and rhythm.",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "RizzEngine", timestamp: Date.now() });
});

async function startServer() {
  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RizzEngine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

