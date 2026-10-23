import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "sun" | "warning" | "demo";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink border-border",
  accent: "bg-accent-soft text-accent-strong border-accent/25",
  sun: "bg-sun-soft text-ink border-sun/60",
  warning: "bg-warning-soft text-warning border-warning/25",
  demo: "bg-ink text-canvas border-ink",
};

type BadgeProps = ComponentProps<"span"> & { tone?: Tone };

/** Short status label. Meaning is always carried by the text, never by color alone. */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs leading-5 font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
