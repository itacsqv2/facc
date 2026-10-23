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
            <li>L&apos;area «{activeTerritory.name}» e le sue località sono inventate.</li>
            <li>Eventi, organizzatori, indirizzi e contatti sono inventati e marcati DEMO uno per uno.</li>
            <li>Le date si rigenerano ogni giorno a partire da oggi, per provare l&apos;app in qualsiasi momento.</li>
            <li>Non è possibile prenotare né pagare: nessun link porta a biglietti reali.</li>
            <li>Non raccogliamo dati personali, posizione o cookie di tracciamento; i salvati restano nel tuo browser.</li>
          </ul>
        </div>
      </Card>
    </section>
  );
}
