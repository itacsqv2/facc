"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import {
  CHILD_AGES,
  DEFAULT_FILTERS,
  filterCatalog,
  hasRefinements,
  MAX_PRICE_OPTIONS,
  resolveWindow,
  serializeFilters,
  type CatalogFilters,
  type DayWindowKey,
} from "@/modules/catalog/filters";
import { CATEGORY_LABELS, dateBadge } from "@/modules/catalog/format";
import { zonedTimeToUtc } from "@/modules/catalog/time";
import { CATEGORIES, type CatalogEntry, type Category, type Zone } from "@/modules/catalog/types";
import { EventCard } from "./event-card";

type Props = {
  entries: CatalogEntry[];
  /** Reference instant of the server response: keeps SSR and hydration identical. */
  nowIso: string;
  initialFilters: CatalogFilters;
  zones: readonly Zone[];
  territoryName: string;
  timeZone: string;
};

const WINDOW_TEXT: Record<DayWindowKey, { label: string; phrase: string }> = {
  today: { label: "Oggi", phrase: "oggi" },
  weekend: { label: "Questo weekend", phrase: "questo weekend" },
};

function dayRangeLabel(days: string[], timeZone: string): string {
  return days
    .map((day) => {
      const b = dateBadge(zonedTimeToUtc(day, "12:00", timeZone).toISOString(), timeZone);
      return `${b.weekday} ${b.day} ${b.month}`;
    })
    .join(" – ");
}

function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Array<{ value: T; label: string; detail?: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink">{legend}</legend>
      <div className="flex gap-1 rounded-full border border-border-control bg-surface p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center rounded-full px-3 text-center leading-tight transition-colors",
                active ? "bg-accent text-white" : "text-ink hover:bg-accent-soft",
              )}
            >
              <span className="text-sm font-bold whitespace-nowrap">{option.label}</span>
              {option.detail && (
                <span className={cn("text-xs", active ? "text-white/90" : "text-muted")}>{option.detail}</span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CatalogExplorer({ entries, nowIso, initialFilters, zones, territoryName, timeZone }: Props) {
  const now = useMemo(() => new Date(nowIso), [nowIso]);
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [moreOpen, setMoreOpen] = useState(false);
  const panelId = useId();

  const results = useMemo(() => filterCatalog(entries, filters, now, timeZone), [entries, filters, now, timeZone]);
  const refined = hasRefinements(filters);
  const refinementCount = [
    filters.category !== "all",
    filters.price !== "all",
    filters.maxPrice !== null,
    filters.age !== null,
  ].filter(Boolean).length;

  const windowDetail = useMemo(
    () => ({
      today: dayRangeLabel(resolveWindow("today", now, timeZone).days, timeZone),
      weekend: dayRangeLabel(resolveWindow("weekend", now, timeZone).days, timeZone),
    }),
    [now, timeZone],
  );

  // Keep the URL shareable without a server round trip.
  useEffect(() => {
    const query = serializeFilters(filters);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [filters]);

  const update = (patch: Partial<CatalogFilters>) => setFilters((current) => ({ ...current, ...patch }));
  const reset = () => setFilters((current) => ({ ...DEFAULT_FILTERS, window: current.window }));

  const zoneLabel = filters.zone === "all" ? `${territoryName} e dintorni` : (zones.find((z) => z.id === filters.zone)?.name ?? "");
  const countText = `${results.length} attività ${WINDOW_TEXT[filters.window].phrase}`;

  return (
    <div className="container-page">
      <Card className="relative z-10 -mt-6 p-4 sm:-mt-8 sm:p-5">
        <form aria-label="Filtra le attività" onSubmit={(e) => e.preventDefault()} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end">
            <Segmented
              legend="Quando"
              value={filters.window}
              onChange={(window) => update({ window })}
              options={[
                { value: "today", label: WINDOW_TEXT.today.label, detail: windowDetail.today },
                { value: "weekend", label: WINDOW_TEXT.weekend.label, detail: windowDetail.weekend },
              ]}
            />
            <Select label="Zona DEMO" value={filters.zone} onChange={(e) => update({ zone: e.target.value })}>
              <option value="all">Tutte le zone di {territoryName}</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="secondary"
            className="md:hidden"
            aria-expanded={moreOpen}
            aria-controls={panelId}
            onClick={() => setMoreOpen((open) => !open)}
          >
            {moreOpen ? "Nascondi filtri" : "Altri filtri"}
            {refinementCount > 0 && (
              <span className="rounded-full bg-accent px-2 text-xs text-white">
                {refinementCount}
                <span className="sr-only"> attivi</span>
              </span>
            )}
          </Button>

          <div id={panelId} className={cn("gap-4 sm:grid-cols-2 md:grid lg:grid-cols-4", moreOpen ? "grid" : "hidden")}>
            <Select
              label="Categoria"
              value={filters.category}
              onChange={(e) => update({ category: e.target.value as Category | "all" })}
            >
              <option value="all">Tutte le categorie</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </Select>
            <Select
              label="Costo"
              value={filters.price}
              onChange={(e) => update({ price: e.target.value as CatalogFilters["price"] })}
            >
              <option value="all">Tutti</option>
              <option value="free">Solo gratis</option>
              <option value="paid">A pagamento (prezzo indicato)</option>
            </Select>
            <Select
              label="Spesa massima a persona"
              value={filters.maxPrice === null ? "" : String(filters.maxPrice)}
              onChange={(e) => update({ maxPrice: e.target.value ? (Number(e.target.value) as CatalogFilters["maxPrice"]) : null })}
            >
              <option value="">Nessun limite</option>
              {MAX_PRICE_OPTIONS.map((max) => (
                <option key={max} value={max}>
                  Fino a {max} €
                </option>
              ))}
            </Select>
            <Select
              label="Età del bambino"
              value={filters.age === null ? "" : String(filters.age)}
              onChange={(e) => update({ age: e.target.value === "" ? null : Number(e.target.value) })}
            >
              <option value="">Qualsiasi età</option>
              {CHILD_AGES.map((age) => (
                <option key={age} value={age}>
                  {age === 0 ? "Meno di 1 anno" : age === 1 ? "1 anno" : `${age} anni`}
                </option>
              ))}
            </Select>
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted sm:col-span-2 lg:col-span-4">
              <li>Età: mostriamo solo attività che l&apos;organizzatore indica adatte a quell&apos;età o a tutte le età.</li>
              <li>Spesa massima: confrontata con il biglietto intero e solo per prezzi certi. Esclusi «Prezzo da verificare» e prezzi «da…», che possono costare di più.</li>
            </ul>
          </div>
        </form>
      </Card>

      <section id="esplora" aria-labelledby="esplora-title" className="scroll-mt-4 pt-8 pb-12 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div>
            <p className="text-sm font-semibold text-accent">{zoneLabel}</p>
            <h2 id="esplora-title" className="text-title font-bold">
              {filters.window === "today" ? "In programma oggi" : "In programma questo weekend"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Visual highlight remounts on change; the live region stays stable for screen readers. */}
            <p key={serializeFilters(filters)} aria-hidden="true" className="animate-flash rounded-full px-2 py-1 text-sm font-semibold text-ink">
              {countText}
            </p>
            <p aria-live="polite" className="sr-only">
              {countText}
            </p>
            {refined && (
              <Button variant="ghost" onClick={reset}>
                Rimuovi filtri
              </Button>
            )}
          </div>
        </div>

        {results.length > 0 ? (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Risultati">
            {results.map((entry) => (
              <li key={entry.occurrence.id} className="min-w-0">
                <EventCard entry={entry} />
              </li>
            ))}
          </ul>
        ) : (
          <Card tone="sunken" className="mt-5 flex flex-col items-center gap-3 px-6 py-10 text-center">
            <h3 className="text-xl font-bold">
              {refined ? "Nessuna attività con questi filtri" : `Nessuna attività ${WINDOW_TEXT[filters.window].phrase}`}
            </h3>
            <p className="max-w-md text-muted">
              {refined
                ? "Prova ad allargare la zona, l'età o il budget. I filtri tengono fuori anche le attività con dati non indicati."
                : "Nel catalogo dimostrativo non resta nulla in programma per questo periodo."}
            </p>
            {refined ? (
              <Button onClick={reset}>Rimuovi filtri</Button>
            ) : (
              filters.window === "today" && <Button onClick={() => update({ window: "weekend" })}>Guarda questo weekend</Button>
            )}
          </Card>
        )}
      </section>
    </div>
  );
}
