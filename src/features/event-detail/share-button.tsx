"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { title: string };
type Feedback = { kind: "ok" | "error"; text: string } | null;

/** Shares the current page URL: Web Share API when present, otherwise copy to clipboard. Nothing leaves the device otherwise. */
export function ShareButton({ title }: Props) {
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${title} (DEMO)`, url });
        setFeedback({ kind: "ok", text: "Link condiviso." });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setFeedback({ kind: "ok", text: "Link copiato negli appunti." });
    } catch {
      setFeedback({ kind: "error", text: `Copia non riuscita. Copia il link manualmente: ${url}` });
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="secondary" onClick={share}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <path
            d="M12 15V4m0 0L8 8m4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Condividi
      </Button>
      <p role="status" className={feedback?.kind === "error" ? "text-sm break-all text-warning" : "text-sm text-muted"}>
        {feedback?.text ?? ""}
      </p>
    </div>
  );
}
