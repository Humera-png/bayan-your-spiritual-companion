import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronDown, Sparkles, Plus, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Ayah } from "@/lib/quran-api";
import { saveToCollection, listCollections } from "@/lib/quran-api";
import { ShareImageModal } from "@/components/ShareImageModal";

interface Props {
  ayah: Ayah;
  variant?: "hero" | "compact";
  onMarkRead?: () => void;
  showMarkRead?: boolean;
}

export function AyahCard({ ayah, variant = "compact", onMarkRead, showMarkRead }: Props) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [glow, setGlow] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [collections, setCollections] = useState<string[]>(() =>
    typeof window !== "undefined" ? listCollections() : [],
  );
  const [newName, setNewName] = useState("");

  const handleHeart = () => {
    setCollections(listCollections());
    setPickerOpen(true);
  };

  const handlePick = async (name: string) => {
    await saveToCollection(ayah.id, name);
    setSaved(true);
    setPickerOpen(false);
    toast.success(`Saved to "${name}"`, {
      description: `${ayah.surahName} · Verse ${ayah.ayah}`,
    });
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await handlePick(trimmed);
    setNewName("");
  };

  const handleRead = () => {
    setGlow(true);
    onMarkRead?.();
    setTimeout(() => setGlow(false), 2400);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`glass shadow-soft relative overflow-hidden rounded-3xl p-6 ${
        glow ? "animate-golden-glow" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-30"
        style={{ background: "var(--gradient-gold)", filter: "blur(40px)" }}
      />
      {variant === "hero" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--gold) 22%, transparent) 0%, transparent 38%, transparent 62%, color-mix(in oklab, var(--gold) 14%, transparent) 100%)",
          }}
        />
      )}

      <header className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-gold flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-teal">
            {ayah.surah}
          </span>
          <div>
            <p className="font-display text-base leading-none text-teal">{ayah.surahName}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Verse {ayah.ayah}
            </p>
          </div>
        </div>
        <button
          onClick={handleHeart}
          className={`rounded-full p-2 transition hover:bg-accent ${
            saved ? "text-gold" : "text-teal/70 hover:text-gold"
          }`}
          aria-label="Save to collection"
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </header>

      <p
        dir="rtl"
        lang="ar"
        className={`font-arabic text-teal ${
          variant === "hero" ? "text-[28px] leading-[2.2]" : "text-[22px] leading-[2]"
        } mb-5 text-right`}
      >
        {ayah.arabic}
      </p>

      <p className="font-display text-[17px] leading-relaxed text-foreground/85">
        “{ayah.translation}”
      </p>

      {ayah.tafsir && (
        <div className="mt-5 border-t border-gold/20 pt-4">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between text-left text-sm font-medium text-teal"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-gold" />
              Deep Reflection
            </span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={16} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{ayah.tafsir}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {showMarkRead && (
        <button
          onClick={handleRead}
          className="bg-gradient-teal mt-6 w-full rounded-2xl py-3 text-sm font-medium text-cream shadow-soft transition active:scale-[0.98]"
        >
          Mark as Read
        </button>
      )}

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPickerOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-teal/30 px-4 pb-6 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass shadow-glass w-full max-w-md rounded-3xl p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Save verse</p>
              <h3 className="font-display text-2xl text-teal">Save to which collection?</h3>
              <div className="mt-4 space-y-1.5">
                {collections.map((c) => (
                  <button
                    key={c}
                    onClick={() => handlePick(c)}
                    className="hover:bg-accent/60 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="bg-gradient-gold flex h-7 w-7 items-center justify-center rounded-full text-teal">
                        <Heart size={12} fill="currentColor" />
                      </span>
                      <span className="text-sm font-medium text-teal">{c}</span>
                    </span>
                    <Check size={14} className="text-teal/40" />
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2 border-t border-gold/15 pt-4">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New collection…"
                  className="bayan-input flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <button
                  onClick={handleCreate}
                  className="bg-gradient-teal flex items-center gap-1 rounded-xl px-4 text-xs font-medium text-cream"
                >
                  <Plus size={14} /> Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
