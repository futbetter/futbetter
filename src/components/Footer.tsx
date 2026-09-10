import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { Send, Music2 } from "lucide-react";
import { XIcon, InstagramIcon } from "@/components/icons/SocialIcons";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { href: "/", label: "Home" },
      { href: "/news", label: "News" },
      { href: "/analysis", label: "Analysis" },
      { href: "/matches", label: "Matches" },
      { href: "/results", label: "Results" },
      { href: "/rankings", label: "Rankings" },
    ],
  },
  {
    title: "Business",
    links: [
      { href: "/advertise", label: "Advertise" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/community-rules", label: "Community Rules" },
      { href: "/advertising-policy", label: "Advertising Policy" },
      { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
    ],
  },
];

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand font-black text-black">
                F
              </span>
              <span className="text-lg font-black">
                Fut<span className="text-brand">Better</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{settings.slogan}</p>
            <div className="mt-4 flex gap-3">
              <a href={settings.socialTelegram} target="_blank" rel="noreferrer" className="text-muted hover:text-brand" aria-label="Telegram">
                <Send size={18} />
              </a>
              <a href={settings.socialInstagram} target="_blank" rel="noreferrer" className="text-muted hover:text-brand" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href={settings.socialX} target="_blank" rel="noreferrer" className="text-muted hover:text-brand" aria-label="X">
                <XIcon size={18} />
              </a>
              <a href={settings.socialTiktok} target="_blank" rel="noreferrer" className="text-muted hover:text-brand" aria-label="TikTok">
                <Music2 size={18} />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-foreground/80 hover:text-brand">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} FutBetter. All rights reserved. Contact:{" "}
            <a href={`mailto:${settings.contactEmail}`} className="hover:text-brand">
              {settings.contactEmail}
            </a>
          </p>
          <p>18+ where applicable. Please gamble responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
