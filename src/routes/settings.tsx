import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, BookOpen, Languages, Moon, Volume2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Bayan" },
      { name: "description", content: "Personalize your daily ritual, recitation, and reminders." },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  {
    title: "Ritual",
    items: [
      { icon: Bell, label: "Daily reminder", value: "08:00 AM" },
      { icon: BookOpen, label: "Daily goal", value: "1 verse" },
    ],
  },
  {
    title: "Recitation",
    items: [
      { icon: Volume2, label: "Reciter", value: "Mishary Al-Afasy" },
      { icon: Languages, label: "Translation", value: "Saheeh International" },
    ],
  },
  {
    title: "Appearance",
    items: [{ icon: Moon, label: "Theme", value: "System" }],
  },
];

function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Personalize</p>
        <h1 className="font-display text-3xl text-teal">Settings</h1>
      </motion.header>

      {sections.map((s, si) => (
        <motion.section
          key={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.06 }}
          className="space-y-2"
        >
          <h2 className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {s.title}
          </h2>
          <div className="glass shadow-soft divide-y divide-gold/10 overflow-hidden rounded-2xl">
            {s.items.map(({ icon: Icon, label, value }) => (
              <button
                key={label}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-accent/40"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-teal">
                    <Icon size={15} />
                  </span>
                  <span className="text-sm font-medium text-teal">{label}</span>
                </span>
                <span className="text-xs text-muted-foreground">{value}</span>
              </button>
            ))}
          </div>
        </motion.section>
      ))}

      <p className="pt-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Bayan · v0.1
      </p>
    </div>
  );
}
