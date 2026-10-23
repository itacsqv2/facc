import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentProps<"div"> & { tone?: "surface" | "sunken" | "accent" };

const tones = {
  surface: "bg-surface border border-border shadow-card",
  sunken: "bg-surface-sunken border border-border",
  accent: "bg-accent-soft border border-accent/20",
} as const;

export function Card({ tone = "surface", className, ...props }: CardProps) {
  return <div className={cn("rounded-lg p-5 sm:p-6", tones[tone], className)} {...props} />;
}
