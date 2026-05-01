import { motion } from "framer-motion";

export interface SegmentOption {
  id: string;
  label: string;
}

interface Props {
  options: SegmentOption[];
  value: string;
  onChange: (id: string) => void;
}

export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <div className="ios-segmented">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="haptic relative flex-1 rounded-full px-4 py-2 text-xs font-medium"
          >
            {active && (
              <motion.span
                layoutId="segmented-active"
                className="glass-strong absolute inset-0 rounded-full shadow-soft"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                active ? "text-teal" : "text-teal/55"
              }`}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
