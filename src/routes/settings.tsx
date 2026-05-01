import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Languages,
  LogOut,
  Moon,
  Volume2,
  Sunrise,
  Sunset,
  Flame,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  auth,
  getNotifications,
  saveNotifications,
  getPreferences,
  type NotificationSettings,
} from "@/services/quranApi";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Bayan" },
      { name: "description", content: "Personalize your daily ritual, recitation, and reminders." },
    ],
  }),
  component: SettingsPage,
});

const NOTIF_ITEMS: {
  key: keyof NotificationSettings;
  icon: typeof Bell;
  label: string;
  desc: string;
}[] = [
  { key: "morningDhikr", icon: Sunrise, label: "Morning Dhikr", desc: "A gentle 6:30 AM nudge." },
  { key: "eveningReflection", icon: Sunset, label: "Evening Reflection", desc: "Wind down at sunset." },
  { key: "streakReminders", icon: Flame, label: "Streak Reminders", desc: "Don't break the chain." },
  { key: "newVerseAlerts", icon: Sparkles, label: "New Verse Alerts", desc: "Featured weekly verses." },
];

function SettingsPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [notifs, setNotifs] = useState<NotificationSettings>(() => getNotifications());
  const [prefs, setPrefs] = useState(() => getPreferences());

  useEffect(() => {
    setName(auth.current()?.name ?? "");
    setNotifs(getNotifications());
    setPrefs(getPreferences());
  }, []);

  const toggle = (key: keyof NotificationSettings) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    saveNotifications(next);
  };

  const handleSignOut = () => {
    auth.signOut();
    toast("Signed out", { description: "We'll keep your seat warm." });
    navigate({ to: "/welcome" });
  };

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Personalize</p>
        <h1 className="font-display text-3xl text-teal">Settings</h1>
        {name && (
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-teal">{name}</span>
          </p>
        )}
      </motion.header>

      {/* Notification Center */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Notifications
        </h2>
        <div className="glass shadow-soft divide-y divide-gold/10 overflow-hidden rounded-2xl">
          {NOTIF_ITEMS.map(({ key, icon: Icon, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 px-4 py-3.5"
            >
              <span className="flex items-center gap-3">
                <span className="bg-gradient-gold flex h-9 w-9 items-center justify-center rounded-xl text-teal">
                  <Icon size={15} />
                </span>
                <span>
                  <p className="text-sm font-medium text-teal">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </span>
              </span>
              <IOSToggle on={notifs[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </motion.section>

      {/* Ritual */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-2"
      >
        <h2 className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Ritual
        </h2>
        <div className="glass shadow-soft divide-y divide-gold/10 overflow-hidden rounded-2xl">
          <Row
            icon={BookOpen}
            label="Daily goal"
            value={`${prefs.dailyGoal ?? 1} ayah${(prefs.dailyGoal ?? 1) === 1 ? "" : "s"}`}
          />
          <Row icon={Bell} label="Daily reminder" value="08:00 AM" />
          <Row
            icon={Sparkles}
            label="Focus"
            value={prefs.intent ?? "Peace"}
          />
        </div>
      </motion.section>

      {/* Recitation */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <h2 className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Recitation
        </h2>
        <div className="glass shadow-soft divide-y divide-gold/10 overflow-hidden rounded-2xl">
          <Row
            icon={Volume2}
            label="Reciter"
            value={prefs.reciter ?? "Mishary Rashid Alafasy"}
          />
          <Row icon={Languages} label="Translation" value="Saheeh International" />
          <Row icon={Moon} label="Theme" value="System" />
        </div>
      </motion.section>

      <button
        onClick={handleSignOut}
        className="haptic glass shadow-soft flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-teal transition hover:text-destructive"
      >
        <LogOut size={15} /> Sign out
      </button>

      <p className="pt-2 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Bayan · v1.0
      </p>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bell;
  label: string;
  value: string;
}) {
  return (
    <button className="haptic flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-accent/40">
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-teal">
          <Icon size={15} />
        </span>
        <span className="text-sm font-medium text-teal">{label}</span>
      </span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </button>
  );
}

function IOSToggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={on}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        on ? "bg-gradient-teal" : "bg-teal/15"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-cream shadow-soft ${
          on ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}
