"use client";

import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventCard } from "@/features/catalog/event-card";
import { isEnded } from "@/modules/catalog/filters";
import { statusLabel } from "@/modules/catalog/format";
import type { CatalogEntry } from "@/modules/catalog/types";
import { savedKey } from "@/modules/saved/saved-items";
import { useSaved } from "@/modules/saved/use-saved";

type Props = { entries: CatalogEntry[]; nowIso: string };

export function SavedList({ entries, nowIso }: Props) {
  const { status, items, toggle } = useSaved();
  const now = new Date(nowIso);

  if (status === "loading") {
    return <p className="mt-6 text-muted">Caricamento dei salvati…</p>;
  }
  if (status === "unavailable") {
    return (
      <Card tone="sunken" className="mt-6">
        <p className="font-semibold">I salvati non sono disponibili su questo browser.</p>
        <p className="text-muted">La memoria locale è disattivata o bloccata (ad esempio in navigazione privata).</p>
      </Card>
    );
  }
  if (items.length === 0) {
    return (
      <Card tone="sunken" className="mt-6 flex flex-col items-start gap-3">
        <h2 className="text-xl font-bold">Non hai ancora salvato nulla</h2>
        <p className="text-muted">Apri la scheda di un&apos;attività e premi «Salva»: la ritroverai qui, su questo dispositivo.</p>
        <ButtonLink href="/">Esplora le attività</ButtonLink>
      </Card>
    );
  }

  const byKey = new Map(entries.map((entry) => [savedKey({ slug: entry.event.slug, occurrenceId: entry.occurrence.id }), entry]));

  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Attività salvate">
      {items.map((item) => {
        const entry = byKey.get(savedKey(item));
        const remove = () => toggle(item);
        if (!entry) {
          return (
            <li key={savedKey(item)} className="min-w-0">
              <Card tone="sunken" className="flex h-full flex-col gap-3">
                <p className="font-semibold">Attività non più disponibile</p>
                <p className="text-sm text-muted">Questa data non è più nel catalogo dimostrativo.</p>
                <Button variant="secondary" onClick={remove}>
                  Rimuovi dai salvati
                </Button>
              </Card>
            </li>
          );
        }
        return (
          <li key={savedKey(item)} className="flex min-w-0 flex-col gap-2">
            <EventCard entry={entry} headingLevel="h2" statusText={statusLabel(entry.occurrence.status, isEnded(entry.occurrence, now))} />
            <Button variant="ghost" className="self-start" onClick={remove} aria-label={`Rimuovi «${entry.event.title}» dai salvati`}>
              Rimuovi dai salvati
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export function SavedIntroLink() {
  return (
    <Link href="/" className="font-semibold text-accent underline underline-offset-2 hover:text-accent-strong">
      Torna alle attività
    </Link>
  );
}
