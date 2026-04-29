import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Search, Sparkles } from "lucide-react";
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

  useEffect(() => {
    searchVerses("Gratitude").then((r) => {
      setResults(r);
      setLoading(false);
    });
  }, []);

  const runSearch = async (q: string) => {
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
        className="glass shadow-soft flex items-center gap-2 rounded-2xl px-4 py-3"
      >
        <Search size={18} className="text-teal/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What is on your heart?"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
        />
        {query && (
          <button
            type="submit"
            className="bg-gradient-gold rounded-full px-3 py-1.5 text-xs font-medium text-teal"
          >
            Ask
          </button>
        )}
      </form>

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
                  className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
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
          <div className="glass shadow-soft flex items-center gap-3 rounded-2xl px-5 py-6">
            <Loader2 size={18} className="animate-spin text-gold" />
            <p className="text-sm text-teal">Searching the Quran…</p>
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
    </motion.article>
  );
}
