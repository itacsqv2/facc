import { siteConfig } from "@/config/site";

const steps = [
  {
    title: "Scegli zona e giorno",
    text: "Scegli una zona e se ti serve un'idea per oggi o per il weekend. Non serve registrarsi.",
  },
  {
    title: "Confronta le informazioni pratiche",
    text: "Orari, età, costo e prenotazione sono in vista. Puoi filtrare per ciò che conta per la tua famiglia.",
  },
  {
    title: "Prenota dall'organizzatore",
    text: `${siteConfig.name} non vende biglietti: ti porta alla pagina o al contatto ufficiale di chi organizza.`,
  },
] as const;

const principles = [
  "Posizione usata solo se la chiedi tu",
  "Prezzo sconosciuto non diventa «gratis»",
  "Eventi annullati segnalati in modo chiaro",
] as const;

export function HowItWorks() {
  return (
    <section id="come-funziona" aria-labelledby="come-funziona-title" className="scroll-mt-4 bg-surface py-14 sm:py-20">
      <div className="container-page">
        <h2 id="come-funziona-title" className="text-title font-bold">
          Come funziona
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 md:flex-col">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-sun font-display text-lg font-bold text-ink"
              >
                {index + 1}
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <ul aria-label="I nostri impegni" className="mt-10 flex flex-wrap gap-2">
          {principles.map((principle) => (
            <li
              key={principle}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-3.5 py-2 text-sm font-medium"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 text-accent">
                <path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {principle}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
