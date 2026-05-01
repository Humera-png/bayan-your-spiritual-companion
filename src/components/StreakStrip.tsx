import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Props {
  /** Map of YYYY-MM-DD -> read count */
  readLog: Record<string, string[] | undefined>;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function StreakStrip({ readLog }: Props) {
  const days: { date: Date; key: string; done: boolean; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: d,
      key,
      done: !!readLog[key]?.length,
      isToday: i === 0,
    });
  }

  return (
    <div suppressHydrationWarning className="glass shadow-soft flex items-center justify-between rounded-2xl px-3 py-3">
      {days.map((d, i) => (
        <motion.div
          key={d.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className={`text-[10px] uppercase tracking-wider ${
              d.isToday ? "text-gold" : "text-muted-foreground"
            }`}
          >
            {DAY_LABELS[d.date.getDay()]}
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${
              d.done
                ? "bg-gradient-gold text-teal shadow-glow"
                : d.isToday
                  ? "border border-dashed border-gold/60 text-teal"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {d.done ? <Check size={14} strokeWidth={2.4} /> : d.date.getDate()}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
