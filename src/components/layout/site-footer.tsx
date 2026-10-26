import { siteConfig } from "@/config/site";
import { activeTerritory } from "@/config/territory";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-sunken">
      <div className="container-page grid gap-8 py-10 text-sm sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-2">
          <p className="font-display text-xl font-bold text-ink">{siteConfig.name}</p>
          <p className="max-w-sm text-muted">
            Nome di lavoro provvisorio. Un progetto per scegliere attività vicine con informazioni pratiche affidabili.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-sans text-sm font-bold text-ink">Stato del progetto</h2>
          <ul className="space-y-1 text-muted">
            <li>Prototipo in sviluppo</li>
            <li>Area {activeTerritory.isDemo ? "dimostrativa" : "attiva"}: {activeTerritory.name}</li>
            <li>Nessun acquisto o prenotazione su {siteConfig.name}</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="font-sans text-sm font-bold text-ink">Privacy</h2>
          <ul className="space-y-1 text-muted">
            <li>Nessun account richiesto</li>
            <li>Nessun cookie di tracciamento</li>
            <li>Posizione usata solo nel browser, su richiesta</li>
          </ul>
        </div>
      </div>
      <p className="container-page border-t border-border py-4 text-xs text-muted">
        © {siteConfig.name} · Versione DEMO con dati fittizi, non destinata all&apos;uso pubblico.
      </p>
    </footer>
  );
}
