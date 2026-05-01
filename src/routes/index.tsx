import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AyahCard } from "@/components/AyahCard";
import { ProgressRing } from "@/components/ProgressRing";
import { StreakStrip } from "@/components/StreakStrip";
import { AudioPlayer } from "@/components/AudioPlayer";
import { computeStreak, getReadLog, type Ayah } from "@/lib/quran-api";
import { getDailyVerse, updateUserStreak } from "@/services/quranApi";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Bayan" },
      {
        name: "description",
        content: "Your daily ayah, reflection, streak, and recitation in one calm view.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [readLog, setReadLog] = useState<Record<string, string[]>>({});
  const [readToday, setReadToday] = useState(false);

  useEffect(() => {
    getDailyVerse().then(setAyah);
    const log = getReadLog();
    setReadLog(log);
    const today = new Date().toISOString().slice(0, 10);
    setReadToday(!!log[today]?.length);
  }, []);

  const streak = computeStreak(readLog);
  const progress = readToday ? 1 : 0;

  const handleMark = async () => {
    if (!ayah) return;
    const { streak: newStreak } = await updateUserStreak(ayah.id);
    setReadLog(getReadLog());
    setReadToday(true);
    toast.success(`Marked as read ✨`, {
      description:
        newStreak > 1 ? `${newStreak}-day streak — keep going.` : "Your streak begins today.",
    });
  };

  const greeting = greetingForNow();

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">{greeting}</p>
          <h1 className="font-display text-3xl text-teal">Bayan</h1>
        </div>
          <ProgressRing
            value={progress}
            label={readToday ? "1/1" : "0/1"}
            sub={readToday ? "Complete" : "Today"}
          />
      </motion.header>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="font-display text-lg text-teal">Your week</h2>
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-gold">{streak}</span> day streak
          </span>
        </div>
        <StreakStrip readLog={readLog} />
      </section>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="font-display text-lg text-teal">Verse of the day</h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        {ayah ? (
          <AyahCard ayah={ayah} variant="hero" showMarkRead={!readToday} onMarkRead={handleMark} />
        ) : (
          <div className="glass shadow-soft rounded-3xl p-6">
            <div className="bayan-skeleton mb-4 h-5 w-1/3" />
            <div className="bayan-skeleton mb-2 ml-auto h-7 w-3/4" />
            <div className="bayan-skeleton mb-2 ml-auto h-7 w-2/3" />
            <div className="bayan-skeleton mt-5 h-4 w-full" />
            <div className="bayan-skeleton mt-2 h-4 w-5/6" />
          </div>
        )}
      </section>

      {ayah && (
        <AudioPlayer
          src={ayah.audioUrl}
          title={`${ayah.surahName} · ${ayah.ayah}`}
          subtitle="Mishary Al-Afasy"
        />
      )}
    </div>
  );
}

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Good night";
}
