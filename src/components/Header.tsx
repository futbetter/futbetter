import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { HeaderClient } from "./HeaderClient";

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/matches", label: "MATCHES" },
  { href: "/news", label: "NEWS" },
  { href: "/analysis", label: "ANALYSIS" },
  { href: "/results", label: "RESULTS" },
  { href: "/rankings", label: "RANKINGS" },
  { href: "/about", label: "ABOUT" },
];

export async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand font-black text-black">
            F
          </span>
          <span className="text-lg font-black tracking-tight">
            Fut<span className="text-brand">Better</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-semibold tracking-wide text-muted transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <HeaderClient siteName={settings.siteName} />
      </div>
    </header>
  );
}
