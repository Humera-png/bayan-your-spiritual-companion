import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Folder, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AyahCard } from "@/components/AyahCard";
import {
  listSaved,
  removeFromCollection,
  semanticSearch,
  type Ayah,
  type SavedItem,
} from "@/lib/quran-api";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "My Heart — Bayan" },
      {
        name: "description",
        content: "Verses you've saved, organized into your own collections.",
      },
    ],
  }),
  component: SavedPage,
});

type Item = SavedItem & { ayah?: Ayah };

function SavedPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const load = async () => {
    const saved = await listSaved();
    const all = await semanticSearch("");
    const byId = new Map(all.map((a) => [a.id, a]));
    setItems(saved.map((s) => ({ ...s, ayah: byId.get(s.ayahId) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const folders = Object.entries(
    items.reduce<Record<string, Item[]>>((acc, i) => {
      (acc[i.collection] ||= []).push(i);
      return acc;
    }, {}),
  );

  const toggle = (name: string) =>
    setOpenFolders((o) => ({ ...o, [name]: o[name] === false ? true : !o[name] }));

  const remove = async (id: string, surahName: string) => {
    await removeFromCollection(id);
    toast(`Removed from collection`, { description: surahName });
    load();
  };

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Collection</p>
        <h1 className="font-display text-3xl text-teal">My Heart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} verse{items.length === 1 ? "" : "s"} across {folders.length} folder
          {folders.length === 1 ? "" : "s"}.
        </p>
      </motion.header>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="glass shadow-soft rounded-2xl p-4">
              <div className="bayan-skeleton mb-3 h-4 w-1/3" />
              <div className="bayan-skeleton h-16 w-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-16 text-center">
          <span className="bg-gradient-gold flex h-12 w-12 items-center justify-center rounded-full text-teal">
            <Heart size={20} />
          </span>
          <h2 className="font-display text-xl text-teal">Nothing saved yet</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Tap the heart on any verse to save it. Organize by mood — Daily Peace, Tough Days,
            and more.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {folders.map(([name, list], fi) => {
            const isOpen = openFolders[name] !== false;
            return (
              <motion.section
                key={name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fi * 0.05 }}
                className="space-y-2"
              >
                <button
                  onClick={() => toggle(name)}
                  className="glass shadow-soft flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
                >
                  <span className="flex items-center gap-3">
                    <span className="bg-gradient-gold flex h-9 w-9 items-center justify-center rounded-xl text-teal">
                      <Folder size={16} />
                    </span>
                    <span>
                      <p className="font-display text-base leading-tight text-teal">{name}</p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {list.length} verse{list.length === 1 ? "" : "s"}
                      </p>
                    </span>
                  </span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={18} className="text-teal/60" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden pl-2"
                    >
                      {list.map(
                        (i, idx) =>
                          i.ayah && (
                            <motion.div
                              key={i.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className="relative"
                            >
                              <AyahCard ayah={i.ayah} />
                              <button
                                onClick={() => remove(i.id, i.ayah!.surahName)}
                                aria-label="Remove from collection"
                                className="hover:text-destructive absolute right-3 top-3 rounded-full p-1.5 text-teal/40"
                              >
                                <Trash2 size={14} />
                              </button>
                            </motion.div>
                          ),
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
