import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Sparkles } from "lucide-react";
import { searchVerses, type VerseSnippet } from "@/services/quranApi";

const TOPICS = [
  "Anxiety",
  "Gratitude",
  "Patience",
  "Family",
  "Work",
  "Forgiveness",
  "Hope",
  "Sadness",
  "Guidance",
];

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Bayan" },
      {
        name: "description",
        content:
          "Ask the Quran what's on your heart, or tap a topic to discover guidance — anxiety, gratitude, patience, and more.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>("Gratitude");
  const [results, setResults] = useState<VerseSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Searching the Revelation…");

  const themedMessage = (q: string) => {
    const word = q.trim().toLowerCase();
    if (!word) return "Searching the Revelation…";
    const themed: Record<string, string> = {
      anxiety: "Finding stillness in the Revelation…",
      gratitude: "Gathering verses of thankfulness…",
      patience: "Listening for sabr in the Revelation…",
      family: "Searching verses on love and kin…",
      work: "Finding strength for the day…",
      forgiveness: "Seeking mercy in the Revelation…",
      hope: "Searching for light in the Revelation…",
      sadness: "Looking for comfort in the Revelation…",
      guidance: "Asking for guidance in the Revelation…",
      peace: "Finding peace in the Revelation…",
    };
    return themed[word] ?? `Finding "${q.trim()}" in the Revelation…`;
  };

  useEffect(() => {
    searchVerses("Gratitude").then((r) => {
      setResults(r);
      setLoading(false);
    });
  }, []);

  const runSearch = async (q: string) => {
    setLoadingMessage(themedMessage(q));
    setLoading(true);
    setResults([]);
    const r = await searchVerses(q);
    setResults(r);
    setLoading(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActive(null);
    await runSearch(query);
  };

  const onTopic = async (t: string) => {
    setActive(t);
    setQuery("");
    await runSearch(t);
  };

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Guidance Hub</p>
        <h1 className="font-display text-3xl text-teal">Ask the Quran</h1>
      </motion.header>

      <form
        onSubmit={onSubmit}
        className="glass-strong shadow-soft flex items-center gap-2 rounded-2xl px-4 py-3"
      >
        <Search size={18} className="text-teal/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the Quran anything (e.g., 'How do I deal with loss?')"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
        />
        {query && (
          <button
            type="submit"
            className="haptic bg-gradient-gold rounded-full px-3 py-1.5 text-xs font-medium text-teal"
          >
            Ask
          </button>
        )}
      </form>
      <p className="-mt-3 px-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Powered by Quran MCP · semantic search
      </p>

      <section>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Sparkles size={14} className="text-gold" />
          <h2 className="font-display text-lg text-teal">Quick links</h2>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2">
            {TOPICS.map((t) => {
              const isActive = active === t;
              return (
              <motion.button
                  key={t}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTopic(t)}
                  className={`haptic shrink-0 rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-gradient-teal text-cream shadow-soft"
                      : "glass text-teal hover:text-gold"
                  }`}
                >
                  {t}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="font-display text-lg text-teal">
            {loading
              ? "Searching"
              : active
                ? `For ${active.toLowerCase()}`
                : query
                  ? `Results for "${query}"`
                  : "Suggested"}
          </h2>
          {!loading && (
            <span className="text-xs text-muted-foreground">{results.length} verses</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass shadow-soft rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="bayan-skeleton h-6 w-6 rounded-full" />
                  <div className="bayan-skeleton h-3 w-32" />
                </div>
                <div className="bayan-skeleton mb-2 ml-auto h-5 w-3/4" />
                <div className="bayan-skeleton h-4 w-full" />
                <div className="bayan-skeleton mt-1.5 h-4 w-2/3" />
              </div>
            ))}
            <p className="pt-1 text-center text-xs italic text-gold">
              {loadingMessage}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="glass rounded-2xl px-5 py-10 text-center text-sm text-muted-foreground">
            No verses found. Try another word.
          </div>
        ) : (
          results.map((v, i) => <ResultCard key={v.id + i} verse={v} index={i} />)
        )}
      </section>
    </div>
  );
}

function ResultCard({ verse, index }: { verse: VerseSnippet; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="glass shadow-soft rounded-2xl p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-gold flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-teal">
            {verse.surah}
          </span>
          <p className="text-sm font-medium text-teal">
            {verse.surahName}{" "}
            <span className="text-muted-foreground">· Verse {verse.ayah}</span>
          </p>
        </div>
        <BookOpen size={14} className="text-teal/50" />
      </div>
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic mb-2 text-right text-[18px] leading-[1.9] text-teal/90"
      >
        {verse.arabic}
      </p>
      <p className="text-sm leading-relaxed text-foreground/80">“{verse.snippet}”</p>
      {verse.context && (
        <div className="mt-3 border-t border-gold/15 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold">Context</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {verse.context}
          </p>
        </div>
      )}
    </motion.article>
  );
}
