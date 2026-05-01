import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, MessageCircle } from "lucide-react";
import { AyahCard } from "@/components/AyahCard";
import { ProgressRing } from "@/components/ProgressRing";
import { StreakStrip } from "@/components/StreakStrip";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ReflectionJournal } from "@/components/ReflectionJournal";
import { SegmentedControl } from "@/components/SegmentedControl";
import { computeStreak, getReadLog, type Ayah } from "@/lib/quran-api";
import { getDailyVerse, updateUserStreak, getPreferences } from "@/services/quranApi";
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
  const [view, setView] = useState<"reflection" | "community">("reflection");
  const [reciter, setReciter] = useState("Mishary Al-Afasy");
  const [goal, setGoal] = useState(1);

  useEffect(() => {
    getDailyVerse().then(setAyah);
    const log = getReadLog();
    setReadLog(log);
    const today = new Date().toISOString().slice(0, 10);
    setReadToday(!!log[today]?.length);
    const prefs = getPreferences();
    if (prefs.reciter) setReciter(prefs.reciter);
    if (prefs.dailyGoal) setGoal(prefs.dailyGoal);
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
          label={readToday ? `${goal}/${goal}` : `0/${goal}`}
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
          <span suppressHydrationWarning className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
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

      <section className="space-y-3">
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as "reflection" | "community")}
          options={[
            { id: "reflection", label: "My Reflection" },
            { id: "community", label: "Community" },
          ]}
        />

        <AnimatePresence mode="wait">
          {view === "reflection" ? (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {ayah && <ReflectionJournal ayahId={ayah.id} />}
            </motion.div>
          ) : (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <CommunityPost
                name="Aisha N."
                time="2h"
                body="This verse landed for me today during work stress. Allah's reminder that ease follows hardship — I'm holding it close."
                surah="Ash-Sharh · 5"
              />
              <CommunityPost
                name="Yusuf K."
                time="5h"
                body="Sharing my reflection on patience — sabr is not passive waiting, it is active trust."
                surah="Al-Baqarah · 153"
              />
              <p className="pt-2 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Community feed · coming soon
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {ayah && (
        <AudioPlayer
          src={ayah.audioUrl}
          title={`${ayah.surahName} · ${ayah.ayah}`}
          subtitle={reciter}
        />
      )}
    </div>
  );
}

function CommunityPost({
  name,
  time,
  body,
  surah,
}: {
  name: string;
  time: string;
  body: string;
  surah: string;
}) {
  return (
    <article className="glass shadow-soft rounded-2xl p-4">
      <header className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="bg-gradient-gold flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-teal">
            {name.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-medium text-teal">{name}</p>
            <p className="text-[11px] text-muted-foreground">{surah} · {time}</p>
          </div>
        </div>
        <Users size={14} className="text-teal/40" />
      </header>
      <p className="text-[13px] leading-relaxed text-foreground/85">{body}</p>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Heart size={12} /> 24</span>
        <span className="flex items-center gap-1"><MessageCircle size={12} /> 5</span>
      </div>
    </article>
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
