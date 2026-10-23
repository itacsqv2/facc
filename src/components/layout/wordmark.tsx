import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Typographic wordmark: provisional, not an approved logo (D008). */
export function Wordmark() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2 rounded-sm" aria-label={`${siteConfig.name}, vai alla home`}>
      <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-accent text-sun">
        <svg viewBox="0 0 24 24" className="size-5">
          <path
            d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.4" fill="currentColor" />
        </svg>
      </span>
      <span className="font-display text-2xl font-bold tracking-tight text-ink group-hover:text-accent">
        {siteConfig.name}
      </span>
    </Link>
  );
}
