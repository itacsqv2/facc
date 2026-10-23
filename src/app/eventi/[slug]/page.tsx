import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventDetailView, EventDetailSkeleton } from "@/features/event-detail/event-detail-view";
import { catalogRepository } from "@/modules/catalog";
import { requestNow } from "@/modules/catalog/clock";

type Props = PageProps<"/eventi/[slug]">;

/**
 * Single public-URL eligibility check (D014): the slug must have at least one
 * non-draft occurrence and `?data=`, when present, must be exactly one of them.
 * It runs before any byte is streamed, so invalid URLs get a real HTTP 404.
 */
async function resolvePublicTarget({ params, searchParams }: Props) {
  const { slug } = await params;
  const { data } = await searchParams;
  const publicIds = await catalogRepository.getPublicOccurrenceIds(slug);
  if (!publicIds) notFound();
  if (data === undefined) return { slug, occurrenceId: undefined };
  if (typeof data !== "string" || !publicIds.includes(data)) notFound();
  return { slug, occurrenceId: data };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await catalogRepository.getEventBySlug(slug, requestNow());
  if (!detail) return { title: "Attività non trovata" };
  // No JSON-LD and noindex (from the root layout): DEMO content must not look like a real event to search engines.
  return {
    title: `${detail.event.title} (DEMO)`,
    description: `${detail.event.summary} Evento dimostrativo con dati fittizi.`,
  };
}

async function DetailContent({ slug, occurrenceId }: { slug: string; occurrenceId: string | undefined }) {
  const now = requestNow();
  const detail = await catalogRepository.getEventBySlug(slug, now);
  if (!detail) notFound();
  return <EventDetailView detail={detail} requestedOccurrenceId={occurrenceId} nowIso={now.toISOString()} />;
}

export default async function EventPage(props: Props) {
  const { slug, occurrenceId } = await resolvePublicTarget(props);
  return (
    <div className="container-page py-6 sm:py-10">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-1 rounded-full text-sm font-semibold text-accent hover:text-accent-strong"
      >
        <span aria-hidden="true">←</span> Torna alle attività
      </Link>
      <Suspense fallback={<EventDetailSkeleton />}>
        <DetailContent slug={slug} occurrenceId={occurrenceId} />
      </Suspense>
    </div>
  );
}
