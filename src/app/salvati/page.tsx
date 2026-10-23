import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { SavedIntroLink, SavedList } from "@/features/saved/saved-list";
import { catalogRepository } from "@/modules/catalog";
import { requestNow } from "@/modules/catalog/clock";

export const metadata: Metadata = { title: "Salvati" };

async function SavedContent() {
  await connection();
  const now = requestNow();
  // Includes cancelled/ended dates so saved items can show their current state honestly.
  const entries = await catalogRepository.listEntries(now);
  return <SavedList entries={entries} nowIso={now.toISOString()} />;
}

export default function SavedPage() {
  return (
    <div className="container-page py-6 sm:py-10">
      <h1 className="text-title font-bold">Salvati</h1>
      <p className="mt-1 text-muted">
        Le attività che hai salvato restano solo su questo dispositivo, senza account. <SavedIntroLink />
      </p>
      <Suspense fallback={<p className="mt-6 text-muted">Caricamento dei salvati…</p>}>
        <SavedContent />
      </Suspense>
    </div>
  );
}
