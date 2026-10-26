"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { eventHref } from "@/features/catalog/event-card";
import { priceLabel, scheduleLabel } from "@/modules/catalog/format";
import type { CatalogEntry } from "@/modules/catalog/types";
import { bboxAround, inBBox, type BBox } from "@/modules/geo/bbox";
import { toEventFeatureCollection } from "@/modules/map/geojson";
import type { MapProviderConfig } from "@/modules/map/provider";
import type { MapApi, MapSelection } from "./event-map";
import { detectWebGL } from "./webgl";
import { siteConfig } from "@/config/site";

const EventMap = dynamic(() => import("./event-map"), {
  ssr: false,
  loading: () => <MapMessage>Caricamento della mappa…</MapMessage>,
});

export type AreaChange = { box: BBox; source: "map" | "position" };

type Props = {
  results: CatalogEntry[];
  provider: MapProviderConfig | null;
  territoryBounds: BBox;
  area: BBox | null;
  timeZone: string;
  onAreaChange: (change: AreaChange) => void;
  onShowList: () => void;
};

type GeoState = "idle" | "locating" | "denied" | "unavailable" | "outside" | "found";

const GEO_MESSAGES: Partial<Record<GeoState, string>> = {
  locating: "Ricerca della posizione…",
  denied: "Permesso di posizione negato o non disponibile. Puoi scegliere una zona dal menu o spostare la mappa.",
  unavailable: "Questo browser non fornisce la posizione. Scegli una zona dal menu o sposta la mappa.",
  outside: "Sei fuori dall'area DEMO di Bergamo: la mappa resta sull'area dimostrativa.",
  found: "Mostriamo le attività entro circa 2 km da te. La posizione non viene salvata.",
};

const noopSubscribe = () => () => {};

function MapMessage({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-sunken p-6 text-center">
      <p className="max-w-sm text-ink">{children}</p>
      {action}
    </div>
  );
}

export function MapPanel({ results, provider, territoryBounds, area, timeZone, onAreaChange, onShowList }: Props) {
  // null during SSR/hydration, then the real capability: no mismatch.
  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [moved, setMoved] = useState(false);
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [geo, setGeo] = useState<GeoState>("idle");
  const apiRef = useRef<MapApi | null>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);

  const { collection, withoutLocation } = useMemo(() => toEventFeatureCollection(results), [results]);
  const byId = useMemo(() => new Map(results.map((entry) => [entry.occurrence.id, entry])), [results]);
  const selected = (selection?.occurrenceIds ?? []).map((id) => byId.get(id)).filter((e): e is CatalogEntry => !!e);
  // Captured once: later area changes move the map explicitly (fitBounds), not by re-creating it.
  const [initialBounds] = useState(area ?? territoryBounds);

  useEffect(() => {
    if (selected.length > 0) previewHeading.current?.focus();
  }, [selected.length]);

  const searchHere = () => {
    const box = apiRef.current?.getBounds();
    if (!box) return;
    setMoved(false);
    setSelection(null);
    onAreaChange({ box, source: "map" });
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeo("unavailable");
      return;
    }
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Used once, in memory, rounded to ~100 m; never stored or sent to our server.
        const point = [Number(position.coords.longitude.toFixed(3)), Number(position.coords.latitude.toFixed(3))] as const;
        if (!inBBox(point, territoryBounds)) {
          setGeo("outside");
          return;
        }
        const box = bboxAround(point, 2);
        setGeo("found");
        setMoved(false);
        setSelection(null);
        apiRef.current?.fitBounds(box);
        onAreaChange({ box, source: "position" });
      },
      () => setGeo("denied"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const listButton = (
    <Button variant="secondary" onClick={onShowList}>
      Mostra la lista
    </Button>
  );

  let canvas: React.ReactNode;
  if (!provider) {
    canvas = <MapMessage action={listButton}>La mappa non è configurata in questa installazione. La lista contiene tutte le attività.</MapMessage>;
  } else if (webgl === null) {
    canvas = <MapMessage>Caricamento della mappa…</MapMessage>;
  } else if (!webgl) {
    canvas = (
      <MapMessage action={listButton}>
        La mappa non è disponibile su questo dispositivo o browser (WebGL disattivato). Puoi usare la lista con gli stessi filtri.
      </MapMessage>
    );
  } else if (status === "error") {
    canvas = (
      <MapMessage action={listButton}>
        Il servizio della mappa non risponde in questo momento. Le attività restano disponibili nella lista.
      </MapMessage>
    );
  } else {
    canvas = (
      <EventMap
        provider={provider}
        collection={collection}
        initialBounds={initialBounds}
        timeZone={timeZone}
        apiRef={apiRef}
        selectedIds={selection?.occurrenceIds ?? []}
        onSelect={setSelection}
        onUserMove={() => setMoved(true)}
        onReady={() => setStatus("ready")}
        onFatalError={() => setStatus("error")}
      />
    );
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={locate} disabled={geo === "locating"}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Usa la mia posizione
        </Button>
        {moved && status === "ready" && <Button onClick={searchHere}>Cerca in questa zona</Button>}
      </div>
      <p role="status" className="mb-3 text-sm text-muted empty:hidden">
        {geo === "found" && !area ? "" : (GEO_MESSAGES[geo] ?? "")}
      </p>

      <section
        aria-label="Mappa delle attività DEMO"
        className="relative -mx-[var(--kesifa-gutter)] h-[70vh] min-h-96 overflow-hidden border-y border-border bg-surface-sunken sm:mx-0 sm:h-[36rem] sm:rounded-lg sm:border"
      >
        {canvas}
        <p className="pointer-events-none absolute top-3 left-3 z-10 rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-canvas">
          Mappa DEMO · eventi fittizi
        </p>

        {selected.length > 0 && (
          // Mobile bottom sheet stops above the attribution line, which must stay visible.
          <div
            role="dialog"
            aria-modal="false"
            aria-labelledby="map-preview-title"
            onKeyDown={(event) => event.key === "Escape" && setSelection(null)}
            className="absolute inset-x-0 bottom-7 z-20 max-h-[60%] overflow-y-auto rounded-t-lg border-t border-border bg-surface p-4 shadow-card sm:inset-x-auto sm:top-14 sm:bottom-auto sm:left-3 sm:max-h-[calc(100%-5rem)] sm:w-80 sm:rounded-lg sm:border"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 id="map-preview-title" ref={previewHeading} tabIndex={-1} className="text-base font-bold focus:outline-none">
                {selected.length === 1 ? "Anteprima attività" : `${selected.length} attività in questo luogo`}
              </h3>
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="-mt-1 -mr-1 grid size-11 shrink-0 place-items-center rounded-full text-ink hover:bg-surface-sunken"
                aria-label="Chiudi l'anteprima"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
                  <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ul className="mt-2 flex flex-col divide-y divide-border">
              {selected.map((entry) => (
                <li key={entry.occurrence.id} className="py-2">
                  <p className="font-display text-lg leading-snug font-bold">{entry.event.title}</p>
                  <p className="text-sm text-ink">{scheduleLabel(entry.occurrence)}</p>
                  <p className="text-sm text-muted">
                    {priceLabel(entry.event.price)} · {entry.venue.name} · DEMO
                  </p>
                  <Link
                    href={eventHref(entry)}
                    className="mt-1 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 hover:text-accent-strong"
                  >
                    Apri la scheda<span className="sr-only"> di {entry.event.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="mt-3 space-y-2 text-sm text-muted">
        {provider && (
          <p>
            La mappa si carica solo in questa modalità. Le immagini cartografiche arrivano da MapTiler, che riceve la zona
            visualizzata e l&apos;indirizzo IP del dispositivo; {siteConfig.name} non salva la tua posizione.
          </p>
        )}
        <p>
          {collection.features.length} attività sulla mappa
          {withoutLocation.length > 0 && (
            <>
              {" "}
              · {withoutLocation.length} senza posizione, visibili solo nella{" "}
              <button type="button" onClick={onShowList} className="font-semibold text-accent underline underline-offset-2">
                lista
              </button>
            </>
          )}
        </p>
        <details className="rounded-md border border-border bg-surface p-3">
          <summary className="cursor-pointer font-semibold text-ink">Elenco testuale delle attività sulla mappa</summary>
          <ul className="mt-2 space-y-1">
            {results.map((entry) => (
              <li key={entry.occurrence.id}>
                <Link href={eventHref(entry)} className="text-accent underline underline-offset-2">
                  {entry.event.title}
                </Link>{" "}
                · {scheduleLabel(entry.occurrence)} · {entry.venue.coordinates ? entry.venue.name : "posizione non disponibile"}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
