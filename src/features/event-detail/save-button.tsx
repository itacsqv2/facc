"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isSaved } from "@/modules/saved/saved-items";
import { useSaved } from "@/modules/saved/use-saved";

type Props = { slug: string; occurrenceId: string; title: string };

export function SaveButton({ slug, occurrenceId, title }: Props) {
  const { status, items, toggle } = useSaved();
  const [error, setError] = useState(false);
  const saved = isSaved(items, { slug, occurrenceId });

  if (status === "unavailable") {
    return (
      <p role="status" className="text-sm text-warning">
        Il salvataggio non è disponibile: la memoria del browser è disattivata o bloccata.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={saved ? "primary" : "secondary"}
        aria-pressed={saved}
        aria-label={saved ? `Rimuovi «${title}» dai salvati` : `Salva «${title}»`}
        disabled={status === "loading"}
        onClick={() => setError(!toggle({ slug, occurrenceId }))}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <path
            d="M6 4h12v17l-6-4-6 4V4Z"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        {saved ? "Salvato" : "Salva"}
      </Button>
      <p role="status" className="text-sm text-muted">
        {error ? "Non è stato possibile salvare su questo dispositivo." : saved ? "Salvato solo su questo dispositivo." : ""}
      </p>
    </div>
  );
}
