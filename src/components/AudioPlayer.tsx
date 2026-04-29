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
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setCurrent(a.currentTime);
      setProgress(a.currentTime / (a.duration || 1));
    };
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
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

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const v = Number(e.target.value);
    a.currentTime = v * (a.duration || 0);
    setProgress(v);
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
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed inset-x-0 bottom-24 z-40 mx-auto w-full max-w-md px-4"
          >
            <div className="glass shadow-glass rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggle}
                  className="bg-gradient-teal flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cream shadow-soft transition active:scale-95"
                >
                  {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-teal">{title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {subtitle ?? "Recitation"} · {fmt(current)} / {fmt(duration)}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-teal/60 hover:bg-accent"
                  aria-label="Close player"
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={progress}
                onChange={onSeek}
                aria-label="Seek"
                className="bayan-range mt-3 w-full"
                style={{ ["--p" as string]: `${progress * 100}%` }}
              />
              {src && <audio ref={audioRef} src={src} preload="metadata" />}
              {!src && (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Audio unavailable for this verse.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function fmt(s: number) {
  if (!isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
