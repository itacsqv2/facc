"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  AttributionControl,
  LngLatBounds,
  MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
  type MapGeoJSONFeature,
} from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import { useEffect, useRef, type RefObject } from "react";
import { CATEGORY_ICON_PATHS, CATEGORY_SURFACE } from "@/features/catalog/category-visual";
import { CATEGORY_LABELS, dateBadge } from "@/modules/catalog/format";
import type { BBox } from "@/modules/geo/bbox";
import type { EventFeatureCollection, EventFeatureProperties } from "@/modules/map/geojson";
import type { MapProviderConfig } from "@/modules/map/provider";
import type { Category } from "@/modules/catalog/types";

/** Points closer than this at max zoom stay clustered: overlapping venues open a list. */
const CLUSTER_MAX_ZOOM = 16;
const SOURCE_ID = "attorno-events";
const LOAD_TIMEOUT_MS = 15_000;

export type MapSelection = { occurrenceIds: string[] };

export type MapApi = {
  getBounds: () => BBox | null;
  fitBounds: (box: BBox) => void;
};

type Props = {
  provider: MapProviderConfig;
  collection: EventFeatureCollection;
  initialBounds: BBox;
  timeZone: string;
  apiRef: RefObject<MapApi | null>;
  selectedIds: readonly string[];
  onSelect: (selection: MapSelection) => void;
  onUserMove: () => void;
  onReady: () => void;
  onFatalError: (reason: string) => void;
};

const SVG_NS = "http://www.w3.org/2000/svg";

function iconSvg(category: Category): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "size-5");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", CATEGORY_ICON_PATHS[category]);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.8");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  return svg;
}

// No scale/translate utilities here: MapLibre positions markers with an inline transform,
// and CSS `scale` composes before it, shifting the marker away from its coordinates.
const MARKER_BASE =
  "attorno-marker grid place-items-center rounded-full border-2 border-white text-ink shadow-card " +
  "hover:border-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent";

function pointElement(props: EventFeatureProperties, timeZone: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${MARKER_BASE} size-11 ${CATEGORY_SURFACE[props.category]}`;
  button.dataset.category = props.category;
  button.dataset.occurrenceId = props.occurrenceId;
  const day = dateBadge(props.startsAt, timeZone);
  button.setAttribute(
    "aria-label",
    `${props.title} (DEMO), ${CATEGORY_LABELS[props.category]}, ${day.weekday} ${day.day} ${day.month}: apri l'anteprima`,
  );
  button.appendChild(iconSvg(props.category));
  return button;
}

function clusterElement(count: number): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${MARKER_BASE} size-12 bg-accent font-bold text-white`;
  button.dataset.cluster = String(count);
  button.setAttribute("aria-label", `${count} attività in questa zona: avvicina o apri l'elenco`);
  button.textContent = String(count);
  return button;
}

function applySelection(element: HTMLElement, selected: readonly string[]) {
  const id = element.dataset.occurrenceId;
  if (id === undefined) return; // clusters are not selectable
  const active = selected.includes(id);
  element.classList.toggle("ring-4", active);
  element.classList.toggle("ring-sun", active);
  element.setAttribute("aria-pressed", String(active));
}

function toBBox(bounds: LngLatBounds): BBox {
  return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
}

/** Imperative MapLibre wrapper. Loaded lazily, client only (see map-panel.tsx). */
export default function EventMap({
  provider,
  collection,
  initialBounds,
  timeZone,
  apiRef,
  selectedIds,
  onSelect,
  onUserMove,
  onReady,
  onFatalError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const callbacks = useRef({ onSelect, onUserMove, onReady, onFatalError });
  const latestCollection = useRef(collection);
  const selectedRef = useRef(selectedIds);

  useEffect(() => {
    callbacks.current = { onSelect, onUserMove, onReady, onFatalError };
  });

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs?v=6.13.0");

    let styleLoaded = false;
    let failed = false;
    const fail = (reason: string) => {
      if (failed) return;
      failed = true;
      callbacks.current.onFatalError(reason);
    };

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: provider.styleUrl,
        bounds: initialBounds as [number, number, number, number],
        fitBoundsOptions: { padding: 32 },
        maxZoom: CLUSTER_MAX_ZOOM,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });
    } catch {
      fail("init");
      return;
    }
    mapRef.current = map;
    // MapTiler styles evaluate some icon names to a blank string for features without an
    // icon; register an invisible placeholder for those ids only. Real missing icons still warn.
    map.setMissingStyleImageResolver((id) => {
      if (id.trim() === "" && !map.hasImage(id)) {
        map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
      }
    });
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    // Attribution is never collapsed, on any screen size.
    map.addControl(
      // Provider attribution only, so it fits on one line at 320px; the DEMO label is a separate overlay.
      new AttributionControl({ compact: false, customAttribution: provider.attribution }),
      "bottom-right",
    );

    // Only the style is critical: without it there is no map. A failed tile, font or
    // sprite request (flaky network, DNS hiccup) must not hide an otherwise working map.
    const timer = window.setTimeout(() => {
      if (!styleLoaded) fail("timeout");
    }, LOAD_TIMEOUT_MS);
    map.on("style.load", () => {
      styleLoaded = true;
      window.clearTimeout(timer);
    });
    map.on("error", () => {
      if (!styleLoaded) fail("provider");
    });

    const markers = markersRef.current;
    const syncMarkers = () => {
      if (!map.getSource(SOURCE_ID)) return;
      const seen = new Set<string>();
      for (const feature of map.querySourceFeatures(SOURCE_ID) as MapGeoJSONFeature[]) {
        const props = feature.properties as Record<string, unknown>;
        const coords = (feature.geometry as Point).coordinates as [number, number];
        const isCluster = props.cluster === true;
        const key = isCluster ? `cluster-${String(props.cluster_id)}` : String(props.occurrenceId);
        if (seen.has(key)) continue;
        seen.add(key);
        let marker = markers.get(key);
        if (!marker) {
          const element = isCluster
            ? clusterElement(Number(props.point_count))
            : pointElement(props as unknown as EventFeatureProperties, timeZone);
          // MapLibre captures the pointer on its canvas container at pointerdown, which would
          // retarget the click away from the marker: keep marker presses out of map gestures.
          for (const type of ["pointerdown", "mousedown", "touchstart"] as const) {
            element.addEventListener(type, (event) => event.stopPropagation());
          }
          element.addEventListener("click", (event) => {
            event.stopPropagation();
            void handleMarkerClick(isCluster, props, coords);
          });
          applySelection(element, selectedRef.current);
          marker = new Marker({ element }).setLngLat(coords).addTo(map);
          markers.set(key, marker);
        }
      }
      for (const [key, marker] of markers) {
        if (!seen.has(key)) {
          marker.remove();
          markers.delete(key);
        }
      }
    };

    const handleMarkerClick = async (isCluster: boolean, props: Record<string, unknown>, coords: [number, number]) => {
      if (!isCluster) {
        callbacks.current.onSelect({ occurrenceIds: [String(props.occurrenceId)] });
        return;
      }
      const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
      if (!source) return;
      const clusterId = Number(props.cluster_id);
      const zoom = await source.getClusterExpansionZoom(clusterId);
      if (zoom <= map.getMaxZoom()) {
        map.easeTo({ center: coords, zoom });
        return;
      }
      // Same or nearly same place even at max zoom: open the list of its occurrences.
      const leaves = await source.getClusterLeaves(clusterId, 50, 0);
      callbacks.current.onSelect({
        occurrenceIds: leaves.map((leaf) => String((leaf.properties as EventFeatureProperties).occurrenceId)),
      });
    };

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: latestCollection.current as FeatureCollection,
        cluster: true,
        clusterRadius: 48,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
      });
      // An invisible layer keeps the source's features queryable; markers are HTML buttons.
      map.addLayer({ id: `${SOURCE_ID}-anchor`, type: "circle", source: SOURCE_ID, paint: { "circle-radius": 0, "circle-opacity": 0 } });
      callbacks.current.onReady();
    });
    map.on("sourcedata", (event) => {
      if (event.sourceId === SOURCE_ID && map.isSourceLoaded(SOURCE_ID)) syncMarkers();
    });
    map.on("moveend", (event) => {
      syncMarkers();
      // Only user gestures (drag, zoom, keyboard, controls) carry originalEvent.
      if ("originalEvent" in event && event.originalEvent) callbacks.current.onUserMove();
    });

    apiRef.current = {
      getBounds: () => (mapRef.current ? toBBox(mapRef.current.getBounds()) : null),
      fitBounds: (box) => mapRef.current?.fitBounds(box as [number, number, number, number], { padding: 32, maxZoom: 14 }),
    };

    return () => {
      window.clearTimeout(timer);
      apiRef.current = null;
      for (const marker of markers.values()) marker.remove();
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // The map is created once per provider; data and selection update through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.styleUrl]);

  // Same result list as the cards: replace the source data whenever it changes.
  useEffect(() => {
    latestCollection.current = collection;
    const source = mapRef.current?.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(collection as FeatureCollection);
  }, [collection]);

  // Highlight the selected point(s).
  useEffect(() => {
    selectedRef.current = selectedIds;
    for (const marker of markersRef.current.values()) applySelection(marker.getElement(), selectedIds);
  }, [selectedIds]);

  // MapLibre forces position: relative on its container, so size it inside an absolute wrapper.
  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" data-testid="event-map-canvas" />
    </div>
  );
}
