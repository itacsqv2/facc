import { Card } from "@/components/ui/card";
import { activeTerritory } from "@/config/territory";

export function DemoNotice() {
  return (
    <section id="demo" aria-labelledby="demo-title" className="container-page scroll-mt-4 py-14 sm:py-20">
      <Card tone="accent" className="grid gap-4 md:grid-cols-[auto_1fr] md:gap-8">
        <span className="h-fit w-fit rounded-full bg-ink px-3 py-1 text-xs font-bold tracking-wide text-canvas uppercase">
          Modalità DEMO
        </span>
        <div className="space-y-3">
          <h2 id="demo-title" className="text-title font-bold">
            Stai guardando una versione dimostrativa
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-ink">
            <li>La zona geografica ({activeTerritory.name}) è reale e serve solo da sfondo per la mappa.</li>
            <li>Eventi, nomi dei luoghi, organizzatori, indirizzi e contatti sono inventati e marcati DEMO uno per uno: non corrispondono ad attività o enti reali. Le posizioni sulla mappa sono indicative.</li>
            <li>Le date si rigenerano ogni giorno a partire da oggi, per provare l&apos;app in qualsiasi momento.</li>
            <li>Non è possibile prenotare né pagare: nessun link porta a biglietti reali.</li>
            <li>Non raccogliamo dati personali né cookie di tracciamento; i salvati restano nel tuo browser. La tua posizione, se la chiedi, resta nel browser e non viene salvata.</li>
          </ul>
        </div>
      </Card>
    </section>
  );
}
