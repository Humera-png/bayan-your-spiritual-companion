import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, HeartHandshake, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Bayan" },
      {
        name: "description",
        content:
          "Bayan — a calm daily ritual of verse, reflection, and recitation, with mood-based guidance from the Quran.",
      },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && getCurrentUser()) {
      throw redirect({ to: "/" });
    }
  },
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 70%), radial-gradient(60% 40% at 50% 100%, color-mix(in oklab, var(--teal) 14%, transparent), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 text-center"
      >
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Bayan · بَيَان</p>
        <h1 className="font-display mt-3 text-5xl leading-[1.05] text-teal">
          Stillness in
          <br />
          every verse.
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
          A calm daily ritual for verse, reflection, and recitation — and gentle guidance
          from the Quran for whatever's on your heart.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 space-y-3"
      >
        {[
          { icon: BookOpen, title: "Verse of the day", desc: "Hand-picked, with deep reflection." },
          { icon: Sparkles, title: "Guidance hub", desc: 'Ask "what is on your heart?"' },
          { icon: HeartHandshake, title: "My Heart", desc: "Save verses to your collections." },
        ].map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="glass shadow-soft flex items-center gap-3 rounded-2xl p-4"
          >
            <span className="bg-gradient-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-teal">
              <Icon size={18} />
            </span>
            <div>
              <p className="font-display text-base text-teal">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-auto pt-10"
      >
        <Link
          to="/auth"
          search={{ mode: "signup" }}
          className="bg-gradient-teal shadow-glass flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-medium text-cream transition active:scale-[0.99]"
        >
          Get started
          <ArrowRight size={16} />
        </Link>
        <Link
          to="/auth"
          search={{ mode: "signin" }}
          className="mt-3 block text-center text-xs text-muted-foreground"
        >
          Already with us?{" "}
          <span className="font-medium text-teal underline-offset-4 hover:underline">Sign in</span>
        </Link>
      </motion.div>
    </div>
  );
}
