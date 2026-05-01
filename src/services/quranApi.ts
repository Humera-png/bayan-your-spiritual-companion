/**
 * Bayan Service Layer
 * ─────────────────────
 * Centralized client for ALL backend interactions:
 *   - Content (verses, search, audio)        → Quran Foundation API / Quran MCP
 *   - User    (auth, streaks, collections,
 *              preferences, journal, social) → Custom Node.js / Lovable Cloud
 *
 * Swap BASE_URL to point at the Copilot/Node.js backend later — all
 * components import from this file, never directly from `lib/`.
 */

import {
  computeStreak,
  getDailyAyah,
  getReadLog,
  listCollections as _listCollections,
  listSaved as _listSaved,
  markRead,
  removeFromCollection as _removeFromCollection,
  saveToCollection as _saveToCollection,
  semanticSearch,
  type Ayah,
  type SavedItem,
} from "@/lib/quran-api";
import {
  getCurrentUser as _getCurrentUser,
  signIn as _signIn,
  signUp as _signUp,
  signOut as _signOut,
  socialSignIn as _socialSignIn,
  type BayanUser,
} from "@/lib/auth";

// ─── Backend base URL (swap for your Node.js/Copilot endpoint) ──────────────
export const BASE_URL =
  (typeof process !== "undefined" && (process as any).env?.VITE_BAYAN_API) ||
  "https://api.bayan.app/v1";

export type { Ayah, SavedItem, BayanUser };

export interface VerseSnippet {
  id: string;
  surah: number;
  surahName: string;
  ayah: number;
  arabic: string;
  translation: string;
  snippet: string;
  /** Suggested context for MCP-powered results */
  context?: string;
}

// ═══════════════════════ CONTENT (Quran Foundation API) ════════════════════

/** GET ${BASE_URL}/content/daily */
export async function getDailyVerse(): Promise<Ayah> {
  return getDailyAyah();
}

/**
 * Semantic / MCP search.
 * POST ${BASE_URL}/mcp/search { query }
 */
export async function searchVerses(query: string): Promise<VerseSnippet[]> {
  await new Promise((r) => setTimeout(r, 650));
  const ayahs = await semanticSearch(query);
  return ayahs.map((a) => toSnippet(a, query));
}

/** GET ${BASE_URL}/content/audio/:reciterId/:ayahId */
export async function getRecitation(ayahId: string, reciterId = "alafasy") {
  return `https://cdn.islamic.network/quran/audio/128/ar.${reciterId}/${ayahId.replace(":", "_")}.mp3`;
}

// ═══════════════════════ USER (Auth, Streaks, Collections) ═════════════════

// — Auth
export const auth = {
  current: () => _getCurrentUser(),
  signIn: (email: string, password: string) => _signIn(email, password),
  signUp: (name: string, email: string, password: string) => _signUp(name, email, password),
  signOut: () => _signOut(),
  social: (p: "google" | "apple") => _socialSignIn(p),
};

// — Streaks (POST ${BASE_URL}/user/progress/read)
export async function updateUserStreak(ayahId: string) {
  await markRead(ayahId);
  const log = getReadLog();
  return { streak: computeStreak(log), completedToday: true };
}

export function getStreak() {
  return computeStreak(getReadLog());
}

// — Collections (CRUD on ${BASE_URL}/user/collections)
export const collections = {
  list: () => _listCollections(),
  listSaved: () => _listSaved(),
  save: (ayahId: string, name: string, note?: string) =>
    _saveToCollection(ayahId, name, note),
  remove: (id: string) => _removeFromCollection(id),
};

// ═══════════════════════ PREFERENCES (Onboarding) ══════════════════════════

export interface UserPreferences {
  intent?: "Peace" | "Guidance" | "Knowledge" | "Consistency";
  dailyGoal?: 1 | 3 | 5;
  reciter?: string;
  onboarded?: boolean;
}
const PREF_KEY = "bayan.prefs";

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  } catch {
    return {};
  }
}

export function savePreferences(p: Partial<UserPreferences>) {
  const next = { ...getPreferences(), ...p };
  localStorage.setItem(PREF_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("bayan:prefs"));
  return next;
}

// ═══════════════════════ JOURNAL (Reflection entries) ══════════════════════

export interface JournalEntry {
  ayahId: string;
  date: string; // YYYY-MM-DD
  text: string;
  updatedAt: string;
}
const JOURNAL_KEY = "bayan.journal";

function readJournal(): Record<string, JournalEntry> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getJournalEntry(ayahId: string, date = todayKey()): JournalEntry | null {
  return readJournal()[`${date}:${ayahId}`] ?? null;
}

export function saveJournalEntry(ayahId: string, text: string, date = todayKey()) {
  const all = readJournal();
  all[`${date}:${ayahId}`] = { ayahId, date, text, updatedAt: new Date().toISOString() };
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));
}

// ═══════════════════════ NOTIFICATIONS ═════════════════════════════════════

export interface NotificationSettings {
  morningDhikr: boolean;
  eveningReflection: boolean;
  streakReminders: boolean;
  newVerseAlerts: boolean;
}
const NOTIF_KEY = "bayan.notifs";
const DEFAULT_NOTIFS: NotificationSettings = {
  morningDhikr: true,
  eveningReflection: true,
  streakReminders: true,
  newVerseAlerts: false,
};

export function getNotifications(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFS;
  try {
    return { ...DEFAULT_NOTIFS, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}") };
  } catch {
    return DEFAULT_NOTIFS;
  }
}

export function saveNotifications(n: Partial<NotificationSettings>) {
  const next = { ...getNotifications(), ...n };
  localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  return next;
}

// ─── helpers ───────────────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toSnippet(a: Ayah, query?: string): VerseSnippet {
  return {
    id: a.id,
    surah: a.surah,
    surahName: a.surahName,
    ayah: a.ayah,
    arabic: a.arabic,
    translation: a.translation,
    snippet: a.translation.length > 140 ? a.translation.slice(0, 137) + "…" : a.translation,
    context: query ? buildContext(a, query) : undefined,
  };
}

function buildContext(a: Ayah, query: string): string {
  const word = query.trim().toLowerCase();
  if (!word) return `${a.surahName} · ${a.ayah}`;
  return `Selected for "${query}" — themes of ${word} appear in ${a.surahName}, verse ${a.ayah}.`;
}
