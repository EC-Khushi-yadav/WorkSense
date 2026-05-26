/**
 * Context-Aware Productivity Engine
 * Classifies user activity as productive/distraction based on their selected intent.
 * Uses simple keyword-based classification.
 */

export type Intent = "solve_questions" | "watch_lecture" | "assignment" | "coding";

export type ActivityClassification = "productive" | "distraction" | "neutral";

export interface IntentConfig {
  label: string;
  icon: string;
  productiveKeywords: string[];
  distractionKeywords: string[];
}

/**
 * Intent configurations with keyword rules
 */
export const INTENT_CONFIGS: Record<Intent, IntentConfig> = {
  solve_questions: {
    label: "Solve Questions",
    icon: "🧩",
    productiveKeywords: [
      "leetcode", "gfg", "geeksforgeeks", "hackerrank", "codeforces",
      "codechef", "atcoder", "vs code", "vscode", "visual studio",
      "sublime", "atom", "ide", "compiler", "terminal", "cmd",
      "powershell", "python", "java", "c++", "neetcode", "interviewbit",
    ],
    distractionKeywords: [
      "youtube", "instagram", "twitter", "tiktok", "netflix", "reddit",
      "facebook", "snapchat", "whatsapp", "telegram", "discord",
      "spotify", "amazon", "flipkart", "twitch", "pinterest",
    ],
  },
  watch_lecture: {
    label: "Watch Lecture",
    icon: "🎥",
    productiveKeywords: [
      "youtube", "coursera", "udemy", "edx", "khan academy", "nptel",
      "mit ocw", "lecture", "tutorial", "education", "course", "class",
      "learn", "study", "academic", "professor", "college", "university",
      "playlist", "coding", "programming", "dsa", "algorithm", "unacademy",
      "byju", "vedantu", "physics wallah", "freecodecamp", "traversy",
    ],
    distractionKeywords: [
      "instagram", "twitter", "tiktok", "netflix", "reddit",
      "facebook", "snapchat", "whatsapp", "telegram",
      "spotify", "amazon", "flipkart", "twitch", "pinterest",
      "gaming", "memes", "shorts", "reels",
    ],
  },
  assignment: {
    label: "Do Assignment",
    icon: "📝",
    productiveKeywords: [
      "google docs", "notion", "vs code", "vscode", "overleaf", "latex",
      "word", "excel", "powerpoint", "google scholar", "research",
      "pdf", "drive", "slides", "sheets", "canva", "figma",
      "obsidian", "evernote", "onenote", "grammarly", "zotero",
      "mendeley", "terminal", "github", "jupyter", "colab",
    ],
    distractionKeywords: [
      "youtube", "instagram", "twitter", "tiktok", "netflix", "reddit",
      "facebook", "snapchat", "whatsapp", "telegram", "discord",
      "spotify", "amazon", "flipkart", "twitch", "pinterest",
      "gaming", "memes",
    ],
  },
  coding: {
    label: "Coding / Project",
    icon: "💻",
    productiveKeywords: [
      "vs code", "vscode", "visual studio", "github", "gitlab", "bitbucket",
      "terminal", "cmd", "powershell", "bash", "zsh", "stack overflow",
      "stackoverflow", "mdn", "developer", "documentation", "api",
      "postman", "insomnia", "docker", "vercel", "netlify", "heroku",
      "figma", "localhost", "npm", "node", "react", "angular", "vue",
      "python", "java", "javascript", "typescript", "rust", "go",
      "sublime", "intellij", "pycharm", "webstorm", "neovim", "vim",
    ],
    distractionKeywords: [
      "youtube", "instagram", "twitter", "tiktok", "netflix", "reddit",
      "facebook", "snapchat", "whatsapp", "telegram",
      "spotify", "amazon", "flipkart", "twitch", "pinterest",
      "gaming", "memes",
    ],
  },
};


/**
 * Content-level signals that indicate distraction REGARDLESS of platform.
 * Checked BEFORE productiveKeywords so "Song - YouTube" beats "youtube" in watch_lecture.
 */
const DISTRACTION_CONTENT_SIGNALS = [
  // Music & entertainment
  "song", "songs", "music", "soundtrack", "lyric", "lyrics", "remix",
  "music video", "audio", "official audio", "official video",
  // Gaming & fun
  "gameplay", "gaming", "playthrough", "let's play", "walkthrough gameplay",
  "funny", "meme", "memes", "roast", "prank", "challenge",
  "reaction", "unboxing", "haul", "asmr", "mukbang",
  "vlog", "vlogger", "shorts", "reel", "reels",
  // Movies & shows
  "movie", "film", "trailer", "episode", "season", "web series",
  "highlights", "montage", "compilation",
  // Indian entertainment (common)
  "carryminati", "triggered insaan", "mrbeast", "pewdiepie", "bb ki vines",
  "tanmay bhat", "lilly singh",
  // Sports entertainment
  "ipl", "fifa", "nba", "cricket match", "football match",
];

/**
 * Classify an activity based on the user's selected intent.
 * Priority order:
 *   1. Distraction CONTENT signals (page-level keywords — beats platform name)
 *   2. Productive platform/intent keywords
 *   3. Distraction platform keywords
 *   4. Neutral fallback
 */
export function classifyActivity(
  intent: Intent,
  windowTitle: string
): ActivityClassification {
  if (!windowTitle || !intent) return "neutral";

  const title = windowTitle.toLowerCase();
  const config = INTENT_CONFIGS[intent];

  if (!config) return "neutral";

  // ── Step 1: Check distraction CONTENT signals first ──
  // This prevents "Song Title - YouTube" from matching "youtube" in
  // watch_lecture's productiveKeywords and being counted as productive.
  const hasDistractionContent = DISTRACTION_CONTENT_SIGNALS.some((signal) =>
    title.includes(signal)
  );
  if (hasDistractionContent) return "distraction";

  // ── Step 2: Check productive keywords (platform / tool names) ──
  const isProductive = config.productiveKeywords.some((keyword) =>
    title.includes(keyword)
  );
  if (isProductive) return "productive";

  // ── Step 3: Check distraction keywords ──
  const isDistraction = config.distractionKeywords.some((keyword) =>
    title.includes(keyword)
  );
  if (isDistraction) return "distraction";

  return "neutral";
}


/**
 * Get a human-readable label for an intent
 */
export function getIntentLabel(intent: Intent): string {
  return INTENT_CONFIGS[intent]?.label ?? intent;
}

/**
 * Calculate productivity score from session times
 */
export function calculateProductivityScore(
  productiveTime: number,
  totalSessionTime: number
): number {
  if (totalSessionTime <= 0) return 0;
  return Math.round((productiveTime / totalSessionTime) * 100);
}

