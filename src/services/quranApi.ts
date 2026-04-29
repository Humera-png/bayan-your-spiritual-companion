/**
 * Service layer — Quran content + user state
 * ─────────────────────────────────────────────
 * Thin wrapper over `lib/quran-api.ts`. Components should import from here.
 *
 * INTEGRATION POINTS:
 *   • Verses / search → Quran Foundation Content API
 *       https://api-docs.quran.foundation/  (verses, translations, tafsir, audio)
 *   • Streak / bookmarks → User API (Lovable Cloud / Supabase or your own backend)
 */

import {
  computeStreak,
  getDailyAyah,
  getReadLog,
  markRead,
  semanticSearch,
  type Ayah,
} from "@/lib/quran-api";

export interface VerseSnippet {
  id: string;
  surah: number;
  surahName: string;
  ayah: number;
  arabic: string;
  translation: string;
  snippet: string;
}

/**
 * Fetch the verse of the day.
 * TODO: Replace with Quran Foundation Content API
 *   GET https://api.quran.com/api/v4/verses/random?translations=131&fields=text_uthmani
 */
export async function getDailyVerse(): Promise<Ayah> {
  return getDailyAyah();
}

/**
 * Semantic search across the Quran.
 * TODO: Replace with Quran Foundation Content API or Quran MCP search endpoint
 *   GET https://api.quran.com/api/v4/search?q={query}&size=20&translations=131
 */
export async function searchVerses(query: string): Promise<VerseSnippet[]> {
  // simulate latency for UI loading state
  await new Promise((r) => setTimeout(r, 650));
  const ayahs = await semanticSearch(query);
  return ayahs.map(toSnippet);
}

/**
 * Update streak after marking today's verse as read.
 * TODO: Replace with User API call
 *   POST /user/progress { ayahId, readAt }
 */
export async function updateUserStreak(ayahId: string): Promise<{ streak: number; completedToday: boolean }> {
  await markRead(ayahId);
  const log = getReadLog();
  return { streak: computeStreak(log), completedToday: true };
}

function toSnippet(a: Ayah): VerseSnippet {
  return {
    id: a.id,
    surah: a.surah,
    surahName: a.surahName,
    ayah: a.ayah,
    arabic: a.arabic,
    translation: a.translation,
    snippet: a.translation.length > 140 ? a.translation.slice(0, 137) + "…" : a.translation,
  };
}
