import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { AyahCard } from "@/components/AyahCard";
import { MOODS, moodSearch, semanticSearch, type Ayah } from "@/lib/quran-api";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Bayan" },
      {
        name: "description",
        content:
          "Ask the Quran what's on your heart, or tap a feeling to discover guidance — anxiety, gratitude, patience, and more.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [results, setResults] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    moodSearch("Gratitude").then(setResults);
  }, []);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setActive(null);
    const r = await semanticSearch(query);
    setResults(r);
    setLoading(false);
  };

  const onMood = async (m: string) => {
    setActive(m);
    setQuery("");
    setLoading(true);
    const r = await moodSearch(m);
    setResults(r);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Guidance Hub</p>
        <h1 className="font-display text-3xl text-teal">Ask the Quran</h1>
      </motion.header>

      <form onSubmit={onSearch} className="glass shadow-soft flex items-center gap-2 rounded-2xl px-4 py-3">
        <Search size={18} className="text-teal/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What is on your heart today?"
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
          <h2 className="font-display text-lg text-teal">How are you feeling?</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const isActive = active === m;
            return (
              <motion.button
                key={m}
                whileTap={{ scale: 0.95 }}
                onClick={() => onMood(m)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-gradient-teal text-cream shadow-soft"
                    : "glass text-teal hover:text-gold"
                }`}
              >
                {m}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="font-display text-lg text-teal">
            {active ? `For ${active.toLowerCase()}` : query ? "Results" : "Suggested"}
          </h2>
          <span className="text-xs text-muted-foreground">{results.length} verses</span>
        </div>
        {loading ? (
          <div className="glass h-40 animate-pulse rounded-3xl" />
        ) : (
          results.map((a, i) => (
            <motion.div
              key={a.id + i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <AyahCard ayah={a} />
            </motion.div>
          ))
        )}
      </section>
    </div>
  );
}
