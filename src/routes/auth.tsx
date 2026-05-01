import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, signIn, signUp, socialSignIn } from "@/lib/auth";

type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: (s.mode === "signup" ? "signup" : "signin") as Mode,
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && getCurrentUser()) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — Bayan" },
      { name: "description", content: "Sign in or create your Bayan account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const user = isSignup ? signUp(name, email, password) : signIn(email, password);
    setLoading(false);
    toast.success(isSignup ? `Welcome, ${user.name} ✨` : `Welcome back, ${user.name}`, {
      description: isSignup
        ? "Let's personalize your daily ritual."
        : "Your verse is waiting for you.",
    });
    navigate({ to: isSignup ? "/onboarding" : "/" });
  };

  const onSocial = async (provider: "google" | "apple") => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const user = socialSignIn(provider);
    setLoading(false);
    toast.success(`Welcome back, ${user.name}`);
    navigate({ to: "/" });
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 35% at 50% 0%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 70%)",
        }}
      />
      <Link
        to="/welcome"
        className="text-teal/70 inline-flex items-center gap-1.5 text-xs hover:text-teal"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
          {isSignup ? "Begin the journey" : "Continue the journey"}
        </p>
        <h1 className="font-display mt-1 text-3xl text-teal">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
      </motion.header>

      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          onSubmit={onSubmit}
          className="glass shadow-glass mt-6 space-y-4 rounded-3xl p-6"
        >
          {isSignup && (
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bayan-input"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@bayan.app"
              className="bayan-input"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              required
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bayan-input"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-teal shadow-soft mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-cream transition active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {isSignup ? "Create account" : "Sign in"}
          </button>

          <div className="my-2 flex items-center gap-3">
            <div className="bg-border h-px flex-1" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              or continue with
            </span>
            <div className="bg-border h-px flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SocialBtn onClick={() => onSocial("google")} label="Google" />
            <SocialBtn onClick={() => onSocial("apple")} label="Apple" />
          </div>
        </motion.form>
      </AnimatePresence>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {isSignup ? "Already have an account? " : "New to Bayan? "}
        <Link
          to="/auth"
          search={{ mode: isSignup ? "signin" : "signup" }}
          className="font-medium text-teal underline-offset-4 hover:underline"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-teal/70">
        {label}
      </span>
      {children}
    </label>
  );
}

function SocialBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass hover:text-gold rounded-2xl px-4 py-2.5 text-sm font-medium text-teal transition"
    >
      {label}
    </button>
  );
}
