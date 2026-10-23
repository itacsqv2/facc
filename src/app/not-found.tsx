import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pagina non trovata",
};

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="container-page flex flex-col items-start gap-4 py-20">
      <p className="text-sm font-semibold text-accent">Errore 404</p>
      <h1 id="not-found-title" className="text-title font-bold">
        Questa pagina non esiste
      </h1>
      <p className="max-w-lg text-muted">
        Il link potrebbe essere sbagliato o la pagina non è più disponibile. Puoi tornare alla ricerca delle attività.
      </p>
      <ButtonLink href="/" size="lg">
        Torna alla home
      </ButtonLink>
    </section>
  );
}
