import Link from "next/link";
import { Wordmark } from "./wordmark";

const navItems = [
  { href: "/#esplora", label: "Esplora" },
  { href: "/salvati", label: "Salvati" },
  { href: "/#demo", label: "Info DEMO" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <Wordmark />
        <nav aria-label="Principale" className="-mx-1.5 w-full sm:mx-0 sm:w-auto">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-2 text-sm font-semibold whitespace-nowrap sm:px-3 text-ink hover:bg-accent-soft hover:text-accent-strong"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
