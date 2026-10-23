import Link from "next/link";
import { activeTerritory } from "@/config/territory";

/** Permanent notice: every catalog view in this build is synthetic (D009). */
export function DemoBanner() {
  if (!activeTerritory.isDemo) return null;
  return (
    <div role="note" aria-label="Modalità DEMO" className="bg-ink text-canvas">
      <p className="container-page flex flex-wrap items-center gap-x-2 gap-y-0.5 py-2 text-sm">
        <span className="rounded-full bg-sun px-2 py-px text-xs font-bold tracking-wide text-ink uppercase">
          Modalità DEMO
        </span>
        <span>
          Eventi, luoghi e organizzatori sono fittizi e non prenotabili.{" "}
          <Link href="/#demo" className="font-semibold underline underline-offset-2 hover:text-sun">
            Dettagli
          </Link>
        </span>
      </p>
    </div>
  );
}
