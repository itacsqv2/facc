import { activeTerritory } from "@/config/territory";

/** Compact intro: the catalog right below is the main content. */
export function Hero() {
  return (
    <div className="bg-accent-soft">
      <div className="container-page pt-5 pb-10 sm:pt-8 sm:pb-14">
        <p className="mb-1.5 inline-flex items-center gap-2 text-sm font-semibold text-accent-strong">
          <span aria-hidden="true" className="size-2 rounded-full bg-sun" />
          Area DEMO · {activeTerritory.name}
        </p>
        <h1 className="max-w-3xl text-[clamp(1.75rem,1.35rem+2vw,2.75rem)] leading-tight font-bold text-ink">
          Cosa facciamo oggi, vicino a noi?
        </h1>
        <p className="mt-2 max-w-2xl text-muted sm:text-lg">
          Orari, luogo, costo e prenotazione in vista. Se un dato non è verificato, te lo diciamo.
        </p>
      </div>
    </div>
  );
}
