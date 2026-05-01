import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { auth, savePreferences, type UserPreferences } from "@/services/quranApi";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.current()) {
      throw redirect({ to: "/welcome" });
    }
  },
  head: () => ({
    meta: [
      { title: "Welcome — Bayan" },
      { name: "description", content: "Personalize your daily Quran ritual." },
    ],
  }),
  component: OnboardingPage,
});

const INTENTS: UserPreferences["intent"][] = ["Peace", "Guidance", "Knowledge", "Consistency"];
const GOALS: UserPreferences["dailyGoal"][] = [1, 3, 5];
const RECITERS = [
  "Mishary Rashid Alafasy",
  "Abdul Rahman As-Sudais",
  "Saad Al-Ghamdi",
  "Maher Al-Muaiqly",
  "Hani Ar-Rifai",
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<UserPreferences["intent"]>("Peace");
  const [goal, setGoal] = useState<UserPreferences["dailyGoal"]>(1);
  const [reciter, setReciter] = useState(RECITERS[0]);
  const [reciterOpen, setReciterOpen] = useState(false);

  const next = () => setStep((s) => s + 1);

  const finish = () => {
    savePreferences({ intent, dailyGoal: goal, reciter, onboarded: true });
    toast.success("Your sanctuary is ready ✨", {
      description: `${goal} ayah${goal === 1 ? "" : "s"} a day · ${reciter.split(" ")[0]}`,
    });
    navigate({ to: "/" });
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <header className="text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Bayan · بَيَان</p>
        <div className="mx-auto mt-5 flex w-24 justify-between">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i === step ? "mx-1 bg-teal" : "mx-1 bg-teal/15"
              }`}
            />
          ))}
        </div>
      </header>

      <div className="relative mt-8 flex-1">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <Card key="intent" title="What is your focus?" subtitle="We'll tune your daily ritual.">
              <div className="grid grid-cols-2 gap-2.5">
                {INTENTS.map((i) => (
                  <Choice
                    key={i}
                    label={i!}
                    active={intent === i}
                    onClick={() => setIntent(i)}
                  />
                ))}
              </div>
              <PrimaryBtn onClick={next}>Continue</PrimaryBtn>
            </Card>
          )}

          {step === 1 && (
            <Card key="goal" title="Daily Goal?" subtitle="A small commitment, kept gently.">
              <div className="grid grid-cols-3 gap-2.5">
                {GOALS.map((g) => (
                  <Choice
                    key={g}
                    label={`${g} Ayah${g === 1 ? "" : "s"}`}
                    active={goal === g}
                    onClick={() => setGoal(g)}
                  />
                ))}
              </div>
              <PrimaryBtn onClick={next}>Continue</PrimaryBtn>
            </Card>
          )}

          {step === 2 && (
            <Card key="voice" title="Select a Voice" subtitle="The reciter you'll hear each day.">
              <div className="relative">
                <button
                  onClick={() => setReciterOpen((o) => !o)}
                  className="haptic glass-strong flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-medium text-teal">{reciter}</span>
                  <motion.span animate={{ rotate: reciterOpen ? 180 : 0 }}>
                    <ChevronDown size={16} className="text-teal/60" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {reciterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="glass-strong absolute z-10 mt-2 w-full overflow-hidden rounded-2xl"
                    >
                      {RECITERS.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setReciter(r);
                            setReciterOpen(false);
                          }}
                          className="haptic flex w-full items-center justify-between px-4 py-3 text-left text-sm text-teal hover:bg-accent/40"
                        >
                          {r}
                          {r === reciter && <Check size={14} className="text-gold" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <PrimaryBtn onClick={finish}>
                Begin
                <ArrowRight size={16} />
              </PrimaryBtn>
            </Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong shadow-[0_24px_60px_-20px_rgba(13,59,63,0.30)] space-y-5 rounded-3xl p-6"
    >
      <div>
        <h2 className="font-display text-3xl leading-tight text-teal">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function Choice({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`haptic rounded-2xl px-4 py-4 text-sm font-medium transition ${
        active
          ? "bg-gradient-teal text-cream shadow-soft"
          : "glass text-teal hover:text-gold"
      }`}
    >
      {label}
    </button>
  );
}

function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="haptic bg-gradient-teal flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-cream shadow-soft"
    >
      {children}
    </button>
  );
}
