import type { Category } from "@/modules/catalog/types";

/** Decorative category surfaces and icons: no photos, so nothing can pass for a real event image. */
export const CATEGORY_SURFACE: Record<Category, string> = {
  laboratori: "bg-sun-soft",
  natura: "bg-accent-soft",
  musica: "bg-plum-soft",
  teatro: "bg-clay-soft",
  musei: "bg-sky-soft",
  sport: "bg-sun-soft",
};

export const CATEGORY_ICON_PATHS: Record<Category, string> = {
  laboratori: "M7 20h10M8 20c-1.5-2-2-4-1.5-7h11c.5 3 0 5-1.5 7M9 13V8a3 3 0 0 1 6 0v5",
  natura: "M12 21v-8m0 0c-4 0-6-3-6-7 4 0 6 3 6 7Zm0 0c0-4 2-7 6-7 0 4-2 7-6 7Z",
  musica: "M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  teatro: "M4 5h16v6a8 8 0 0 1-16 0V5Zm5 5h.01M15 10h.01M9 14c1.7 1.3 4.3 1.3 6 0",
  musei: "M4 20h16M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M12 4l8 4H4l8-4Z",
  sport: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9M12 3C9.5 5.5 8.5 8.5 8.5 12s1 6.5 3.5 9",
};

export function CategoryIcon({ category, className = "size-6" }: { category: Category; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d={CATEGORY_ICON_PATHS[category]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
