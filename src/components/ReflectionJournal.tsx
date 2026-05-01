import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Pencil, Check } from "lucide-react";
import { getJournalEntry, saveJournalEntry } from "@/services/quranApi";

interface Props {
  ayahId: string;
}

export function ReflectionJournal({ ayahId }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const e = getJournalEntry(ayahId);
    if (e) {
      setText(e.text);
      setSavedAt(e.updatedAt);
    }
  }, [ayahId]);

  // debounced autosave
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => {
      saveJournalEntry(ayahId, text);
      setSavedAt(new Date().toISOString());
    }, 600);
    return () => clearTimeout(t);
  }, [text, ayahId]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass shadow-soft overflow-hidden rounded-3xl"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="haptic flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="bg-gradient-gold flex h-8 w-8 items-center justify-center rounded-full text-teal">
            <Pencil size={14} />
          </span>
          <span>
            <p className="font-display text-base text-teal">Reflection journal</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {savedAt ? "Saved · " + new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Private to you"}
            </p>
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={16} className="text-teal/60" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-gold/15 px-5 pb-5 pt-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Capture your heart's response…"
                rows={5}
                className="bayan-input min-h-[120px] resize-none leading-relaxed"
              />
              {savedAt && (
                <p className="mt-2 flex items-center justify-end gap-1 text-[11px] text-teal/60">
                  <Check size={12} className="text-gold" /> Saved to your private journal
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
