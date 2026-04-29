import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Pause, Play, X } from "lucide-react";

interface Props {
  src?: string;
  title: string;
  subtitle?: string;
}

export function AudioPlayer({ src, title, subtitle }: Props) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const onTime = () => setProgress(a.currentTime / (a.duration || 1));
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [open]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.94 }}
        className="bg-gradient-teal shadow-glass animate-gentle-float fixed bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-cream"
        aria-label="Listen"
      >
        <Headphones size={22} strokeWidth={1.8} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-teal/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="glass shadow-glass m-4 w-full max-w-md rounded-3xl p-5"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Recitation</p>
                  <h3 className="font-display text-xl text-teal">{title}</h3>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-teal/60 hover:bg-accent"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4 h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="bg-gradient-gold h-full transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={toggle}
                  className="bg-gradient-teal flex h-16 w-16 items-center justify-center rounded-full text-cream shadow-soft transition active:scale-95"
                >
                  {playing ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
                </button>
              </div>

              {src && <audio ref={audioRef} src={src} preload="metadata" />}
              {!src && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Audio unavailable for this verse.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
