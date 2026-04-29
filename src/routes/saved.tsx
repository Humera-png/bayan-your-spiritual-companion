import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { AyahCard } from "@/components/AyahCard";
import { listSaved, semanticSearch, type Ayah, type SavedItem } from "@/lib/quran-api";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "My Heart — Bayan" },
      {
        name: "description",
        content: "Verses you've saved to your collection — return to them whenever you need them.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [items, setItems] = useState<(SavedItem & { ayah?: Ayah })[]>([]);

  useEffect(() => {
    (async () => {
      const saved = await listSaved();
      const all = await semanticSearch("");
      const byId = new Map(all.map((a) => [a.id, a]));
      setItems(saved.map((s) => ({ ...s, ayah: byId.get(s.ayahId) })));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Collection</p>
        <h1 className="font-display text-3xl text-teal">My Heart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} verse{items.length === 1 ? "" : "s"} saved.
        </p>
      </motion.header>

      {items.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-16 text-center">
          <span className="bg-gradient-gold flex h-12 w-12 items-center justify-center rounded-full text-teal">
            <Heart size={20} />
          </span>
          <h2 className="font-display text-xl text-teal">Nothing saved yet</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Tap the bookmark on any verse to keep it close. Your heart's library lives here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(
            (i, idx) =>
              i.ayah && (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <AyahCard ayah={i.ayah} />
                </motion.div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
