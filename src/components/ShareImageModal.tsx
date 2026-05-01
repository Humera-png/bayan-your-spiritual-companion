import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Ayah } from "@/services/quranApi";

interface Props {
  ayah: Ayah;
  open: boolean;
  onClose: () => void;
}

export function ShareImageModal({ ayah, open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRendering(true);
    setDataUrl(null);
    // small delay so the modal animates first
    const t = setTimeout(() => {
      const url = renderShareImage(ayah);
      setDataUrl(url);
      setRendering(false);
    }, 120);
    return () => clearTimeout(t);
  }, [open, ayah]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `bayan-${ayah.surah}-${ayah.ayah}.png`;
    a.click();
    toast.success("Saved to your device", { description: "Share light wherever you go." });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-teal/40 px-4 pb-6 backdrop-blur-md sm:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-md rounded-3xl p-5 shadow-[0_24px_60px_-20px_rgba(13,59,63,0.50)]"
          >
            <header className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Share as Light</p>
                <h3 className="font-display text-2xl text-teal">Your verse, illuminated</h3>
              </div>
              <button
                onClick={onClose}
                className="haptic glass rounded-full p-2 text-teal/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>

            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-teal/5">
              {rendering && (
                <div className="absolute inset-0 flex items-center justify-center text-teal/60">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              )}
              {dataUrl && (
                <img
                  src={dataUrl}
                  alt={`${ayah.surahName} verse ${ayah.ayah}`}
                  className="h-full w-full object-cover"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <button
              onClick={handleDownload}
              disabled={!dataUrl}
              className="haptic bg-gradient-teal mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-cream shadow-soft disabled:opacity-60"
            >
              <Download size={16} />
              Download Image
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              1080×1080 · ready for Instagram, WhatsApp & more
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Render a 1080×1080 PNG of the verse — Quran Foundation branding-friendly. */
function renderShareImage(ayah: Ayah): string {
  const SIZE = 1080;
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;

  // Background — deep teal with golden glow
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#0D3B3F");
  bg.addColorStop(1, "#0A2A2D");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Soft golden mesh blobs
  const blob = (x: number, y: number, r: number, color: string, alpha: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(color, alpha));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  };
  blob(220, 220, 520, "#C5A059", 0.45);
  blob(900, 900, 600, "#C5A059", 0.30);
  blob(900, 180, 380, "#FDFBF7", 0.10);

  // Glass card
  const pad = 80;
  const cardX = pad;
  const cardY = pad + 30;
  const cardW = SIZE - pad * 2;
  const cardH = SIZE - pad * 2 - 60;
  roundRect(ctx, cardX, cardY, cardW, cardH, 56);
  ctx.fillStyle = "rgba(253, 251, 247, 0.10)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header — Surah badge
  ctx.fillStyle = "#C5A059";
  ctx.font = "600 26px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${ayah.surahName.toUpperCase()}  ·  VERSE ${ayah.ayah}`, SIZE / 2, cardY + 78);

  // Arabic
  ctx.fillStyle = "#FDFBF7";
  ctx.font = "700 56px 'Amiri', serif";
  ctx.direction = "rtl";
  wrapText(ctx, ayah.arabic, SIZE / 2, cardY + 200, cardW - 120, 88);
  ctx.direction = "ltr";

  // Divider
  ctx.strokeStyle = "rgba(197, 160, 89, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SIZE / 2 - 60, cardY + cardH - 240);
  ctx.lineTo(SIZE / 2 + 60, cardY + cardH - 240);
  ctx.stroke();

  // Translation
  ctx.fillStyle = "rgba(253, 251, 247, 0.92)";
  ctx.font = "italic 400 30px 'Cormorant Garamond', serif";
  wrapText(
    ctx,
    `“${ayah.translation}”`,
    SIZE / 2,
    cardY + cardH - 180,
    cardW - 140,
    44,
    4,
  );

  // Footer brand
  ctx.fillStyle = "rgba(253, 251, 247, 0.55)";
  ctx.font = "500 22px 'Inter', sans-serif";
  ctx.fillText("Bayan · بَيَان", SIZE / 2, SIZE - 56);

  return c.toDataURL("image/png");
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6,
) {
  const words = text.split(/\s+/);
  let line = "";
  let lines: string[] = [];
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,3}$/, "…");
  }
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineHeight));
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
