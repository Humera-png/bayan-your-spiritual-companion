/**
 * Quran API integration map
 * ─────────────────────────
 * Central place for all Quran MCP / Content API + User Collections API calls.
 * Replace the mock implementations with real MCP/HTTP calls when wiring up.
 */

export interface Ayah {
  id: string;            // e.g. "2:255"
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  translation: string;
  tafsir?: string;
  audioUrl?: string;
}

export interface SavedItem {
  id: string;
  ayahId: string;
  collection: string;    // "My Heart" by default
  note?: string;
  savedAt: string;
}

/** Default collection folders shown in the picker (UI seeds) */
export const DEFAULT_COLLECTIONS = [
  "Daily Peace",
  "Tough Days",
  "Gratitude",
  "Reflection",
] as const;

/** Each mood maps to a small set of seed verse ids the search returns */
const MOOD_INDEX: Record<string, string[]> = {
  Anxiety: ["13:28", "94:5", "2:286"],
  Gratitude: ["14:7"],
  Patience: ["2:153", "94:5"],
  Family: ["25:74"],
  Work: ["94:5", "2:286"],
  Forgiveness: ["39:53"],
  Hope: ["13:28", "94:5", "3:139"],
  Sadness: ["94:5", "13:28"],
  Guidance: ["1:6"],
};

// ─── Content API (Quran MCP) ────────────────────────────────────────────────

/** GET daily verse — pulls a curated ayah for today */
export async function getDailyAyah(): Promise<Ayah> {
  // TODO: wire to Quran MCP -> /content/daily
  return MOCK_DAILY;
}

/** Semantic search across the Quran by mood / question */
export async function semanticSearch(query: string): Promise<Ayah[]> {
  // TODO: wire to Quran MCP -> /search/semantic { q: query }
  const q = query.trim().toLowerCase();
  if (!q) return ALL_VERSES;
  const moodHit = Object.entries(MOOD_INDEX).find(([m]) => m.toLowerCase() === q);
  if (moodHit) {
    const ids = new Set(moodHit[1]);
    return ALL_VERSES.filter((a) => ids.has(a.id));
  }
  return ALL_VERSES.filter(
    (a) =>
      a.translation.toLowerCase().includes(q) ||
      a.surahName.toLowerCase().includes(q),
  );
}

/** List user's collection names (built-ins + any custom from saved items) */
export function listCollections(): string[] {
  const fromSaved = listSavedLocal().map((s) => s.collection);
  return Array.from(new Set([...DEFAULT_COLLECTIONS, ...fromSaved]));
}

/** Mood-based discovery — curated sets per emotion */
export async function moodSearch(mood: string): Promise<Ayah[]> {
  // TODO: wire to Quran MCP -> /search/mood/:mood
  return MOCK_RESULTS;
}

/** Audio recitation stream URL */
export async function getRecitationUrl(ayahId: string, reciter = "mishary"): Promise<string> {
  // TODO: /audio/:reciter/:ayahId
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahId.replace(":", "_")}.mp3`;
}

// ─── User Collections API ───────────────────────────────────────────────────

/** Save an ayah to a user collection ("My Heart" default) */
export async function saveToCollection(
  ayahId: string,
  collection = "My Heart",
  note?: string,
): Promise<SavedItem> {
  // TODO: POST /user/collections
  const item: SavedItem = {
    id: crypto.randomUUID(),
    ayahId,
    collection,
    note,
    savedAt: new Date().toISOString(),
  };
  const all = listSavedLocal();
  localStorage.setItem("bayan.saved", JSON.stringify([item, ...all]));
  return item;
}

export async function removeFromCollection(id: string): Promise<void> {
  const all = listSavedLocal().filter((i) => i.id !== id);
  localStorage.setItem("bayan.saved", JSON.stringify(all));
}

export async function listSaved(): Promise<SavedItem[]> {
  // TODO: GET /user/collections
  return listSavedLocal();
}

function listSavedLocal(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("bayan.saved") || "[]");
  } catch {
    return [];
  }
}

/** Mark today's verse as read — feeds streak/gamification */
export async function markRead(ayahId: string): Promise<{ streak: number }> {
  // TODO: POST /user/progress/read
  const today = new Date().toISOString().slice(0, 10);
  const log: Record<string, string[]> = JSON.parse(
    localStorage.getItem("bayan.read") || "{}",
  );
  log[today] = Array.from(new Set([...(log[today] || []), ayahId]));
  localStorage.setItem("bayan.read", JSON.stringify(log));
  return { streak: computeStreak(log) };
}

export function getReadLog(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("bayan.read") || "{}");
  } catch {
    return {};
  }
}

export function computeStreak(log: Record<string, string[]>): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (log[key]?.length) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

// ─── Mock data (remove when MCP is wired) ───────────────────────────────────

const MOCK_DAILY: Ayah = {
  id: "13:28",
  surah: 13,
  ayah: 28,
  surahName: "Ar-Ra'd",
  arabic: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
  translation:
    "Those who believe, and whose hearts find rest in the remembrance of Allah. Verily, in the remembrance of Allah do hearts find rest.",
  tafsir:
    "Ibn Kathir notes that the heart's true tranquility is found only in turning toward its Creator — wealth, status, and people may soothe momentarily, but lasting stillness lives in dhikr.",
  audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1908.mp3",
};

const MOCK_RESULTS: Ayah[] = [
  MOCK_DAILY,
  {
    id: "94:5",
    surah: 94,
    ayah: 5,
    surahName: "Ash-Sharh",
    arabic: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    translation: "So indeed, with hardship comes ease.",
  },
  {
    id: "2:286",
    surah: 2,
    ayah: 286,
    surahName: "Al-Baqarah",
    arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond what it can bear.",
  },
  {
    id: "3:139",
    surah: 3,
    ayah: 139,
    surahName: "Aal-E-Imran",
    arabic: "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    translation: "Do not lose heart nor grieve, for you shall be uppermost if you are believers.",
  },
];

export const MOODS = [
  "Anxiety",
  "Gratitude",
  "Patience",
  "Family",
  "Forgiveness",
  "Hope",
  "Sadness",
  "Guidance",
] as const;
