import { Suspense } from "react";
import { CatalogSection, CatalogSkeleton } from "@/features/catalog/catalog-section";
import { DemoNotice } from "@/features/discovery/demo-notice";
import { Hero } from "@/features/discovery/hero";
import { HowItWorks } from "@/features/discovery/how-it-works";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Hero />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogSection searchParams={searchParams} />
      </Suspense>
      <HowItWorks />
      <DemoNotice />
    </>
  );
}
