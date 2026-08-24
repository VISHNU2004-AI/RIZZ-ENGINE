import { PresetChat } from "../types";

// Helper to generate clean SVG data URLs for instant screenshot simulation
function createChatSvg(
  appName: string,
  headerTitle: string,
  messages: { sender: "them" | "me"; text: string; time?: string }[],
  theme: "dark" | "light" | "hinge" | "tinder" | "bumble" | "instagram"
): string {
  const isDark = theme === "dark" || theme === "instagram";
  const bg = isDark ? "#121212" : "#f8fafc";
  const headerBg = isDark ? "#1e1e1e" : "#ffffff";
  const headerText = isDark ? "#ffffff" : "#0f172a";
  const subText = isDark ? "#94a3b8" : "#64748b";

  let themBubble = isDark ? "#27272a" : "#e2e8f0";
  let themText = isDark ? "#f4f4f5" : "#0f172a";
  let meBubble = "#3b82f6";
  let meText = "#ffffff";

  if (theme === "hinge") {
    meBubble = "#5e2d40";
    themBubble = "#f1ece7";
    themText = "#292524";
  } else if (theme === "tinder") {
    meBubble = "#fd5068";
  } else if (theme === "bumble") {
    meBubble = "#f3b924";
    meText = "#000000";
  } else if (theme === "instagram") {
    meBubble = "#6366f1";
  }

  let yOffset = 110;
  const bubblesSvg = messages
    .map((msg) => {
      const isThem = msg.sender === "them";
      const fill = isThem ? themBubble : meBubble;
      const textColor = isThem ? themText : meText;
      const x = isThem ? 30 : 160;
      const width = 230;
      const height = 48;
      const currentY = yOffset;
      yOffset += 62;

      return `
        <g transform="translate(${x}, ${currentY})">
          <rect width="${width}" height="${height}" rx="18" fill="${fill}" />
          <text x="14" y="29" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="450">
            ${escapeXml(msg.text)}
          </text>
        </g>
      `;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="460" viewBox="0 0 420 460">
      <rect width="420" height="460" rx="32" fill="${bg}" />
      
      <!-- Top Status & Header -->
      <rect width="420" height="85" fill="${headerBg}" />
      <circle cx="50" cy="48" r="18" fill="${isDark ? "#3f3f46" : "#cbd5e1"}" />
      <text x="80" y="45" fill="${headerText}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600">${escapeXml(headerTitle)}</text>
      <text x="80" y="62" fill="${subText}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500">${escapeXml(appName)}</text>
      
      <!-- Chat bubbles -->
      ${bubblesSvg}
    </svg>
  `;

  try {
    if (typeof window !== "undefined" && window.btoa) {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
    }
  } catch {
    // fallback
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export const PRESET_CHATS: PresetChat[] = [
  {
    id: "ig-story-reply",
    title: "Instagram Story Reaction",
    app: "Instagram",
    badge: "Story Reply",
    contextDesc: "They posted a story at a scenic cafe with a matcha latte and captioned 'finally found good matcha'",
    previewSnippet: "Reacted '🔥' to your story: 'finally found good matcha'",
    fullTranscript: `App: Instagram DMs
Story Reply to: Cafe Photo ("finally found good matcha in the city 🍵")
Them: Reacted 🔥 to story
Them: ok wait where is this place actually? looks so aesthetic`,
    imageSvgDataUrl: createChatSvg(
      "Instagram DM",
      "sarah.k ✨",
      [
        { sender: "them", text: "Reacted 🔥 to your story" },
        { sender: "them", text: "ok wait where is this place?" },
        { sender: "them", text: "looks so aesthetic" },
      ],
      "instagram"
    ),
  },
  {
    id: "hinge-banter",
    title: "Hinge Prompt Banter",
    app: "Hinge",
    badge: "Dating App Opener",
    contextDesc: "Their prompt said: 'Together we could: debate whether pineapple belongs on pizza and never agree'",
    previewSnippet: "Them: 'i will defend pineapple pizza until the day i die sorry not sorry'",
    fullTranscript: `App: Hinge Match
Prompt: "Together we could: debate whether pineapple belongs on pizza"
Them: i will defend pineapple pizza until the day i die sorry not sorry 🍍
Me: (Waiting for your reply)`,
    imageSvgDataUrl: createChatSvg(
      "Hinge Match",
      "Maya, 23",
      [
        { sender: "them", text: "i will defend pineapple pizza" },
        { sender: "them", text: "until the day i die ngl 🍍" },
      ],
      "hinge"
    ),
  },
  {
    id: "imessage-dry-revival",
    title: "iMessage Dry 'wyd'",
    app: "iMessage",
    badge: "Revive Dead Chat",
    contextDesc: "Haven't talked in 3 days, they just sent a low-effort 'wyd' out of nowhere on Friday evening.",
    previewSnippet: "Them: 'wyd'",
    fullTranscript: `App: iMessage
Context: Chat was quiet for 3 days. It's Friday 8:30 PM.
Them: wyd`,
    imageSvgDataUrl: createChatSvg(
      "iMessage",
      "Jordan",
      [
        { sender: "me", text: "haha that concert was so fun" },
        { sender: "them", text: "yeah fr!!" },
        { sender: "them", text: "wyd" },
      ],
      "dark"
    ),
  },
  {
    id: "tinder-travel-tease",
    title: "Tinder Vacation Photo",
    app: "Tinder",
    badge: "Match First Message",
    contextDesc: "Matched on Tinder, their profile has photos in Tokyo eating ramen and skiing in Hokkaido.",
    previewSnippet: "Them: 'hey! so are you also an adrenaline junkie or do you prefer couch potato vibes?'",
    fullTranscript: `App: Tinder Match
Them: hey! so are you also an adrenaline junkie or do you prefer couch potato vibes? 😂`,
    imageSvgDataUrl: createChatSvg(
      "Tinder",
      "Alex, 25",
      [
        { sender: "them", text: "hey! so are you an adrenaline" },
        { sender: "them", text: "junkie or couch potato vibes? 😂" },
      ],
      "tinder"
    ),
  },
  {
    id: "bumble-first-move",
    title: "Bumble First Move",
    app: "Bumble",
    badge: "Bumble Opening",
    contextDesc: "They made the first move with a cute icebreaker question.",
    previewSnippet: "Them: 'What's the most controversial opinion you have that you'd defend with your life?'",
    fullTranscript: `App: Bumble
Them: What's the most controversial opinion you have that you'd defend with your life? 🎤`,
    imageSvgDataUrl: createChatSvg(
      "Bumble",
      "Chloe, 22",
      [
        { sender: "them", text: "what's the most controversial" },
        { sender: "them", text: "opinion you'd defend w your life? 🎤" },
      ],
      "bumble"
    ),
  },
  {
    id: "snapchat-streak-convo",
    title: "Snapchat / DM Banter",
    app: "Snapchat",
    badge: "Late Night DM",
    contextDesc: "They sent a late-night selfie with caption 'can't sleep at all send help'",
    previewSnippet: "Them: 'can't sleep at all send help lol'",
    fullTranscript: `App: Snapchat
Them: Sent a Chat
Them: can't sleep at all send help lol`,
    imageSvgDataUrl: createChatSvg(
      "Snapchat",
      "Elena 👻",
      [
        { sender: "them", text: "can't sleep at all send help lol" },
      ],
      "dark"
    ),
  },
];
