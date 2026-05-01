import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Compass, Heart, Settings as SettingsIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/auth";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/saved", label: "My Heart", icon: Heart },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

const PUBLIC_PATHS = ["/welcome", "/auth"];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sync = () => setAuthed(!!getCurrentUser());
    sync();
    setReady(true);
    window.addEventListener("bayan:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bayan:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (ready && !authed && !isPublic) {
      navigate({ to: "/welcome" });
    }
  }, [ready, authed, isPublic, navigate]);

  if (isPublic) {
    return (
      <>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-md pb-28">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 70%), radial-gradient(50% 30% at 80% 100%, color-mix(in oklab, var(--teal) 10%, transparent), transparent 70%)",
        }}
      />
      <main className="px-5 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5">
        <div className="glass shadow-glass flex w-full max-w-md items-center justify-around rounded-full px-3 py-2">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-2 text-xs"
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-gradient-teal"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 flex flex-col items-center gap-0.5 transition-colors ${
                    active ? "text-cream" : "text-teal/70"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span className="text-[10px] font-medium tracking-wide">{label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Toaster position="top-center" />
    </div>
  );
}
