import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { getCompetitions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Advertise with FutBetter",
  description: "Reach an engaged football audience through banners, sponsored articles, match sponsorships and partner packages on FutBetter.",
};

const FORMATS = [
  "Homepage & sidebar banners",
  "Match Sponsorship (\"Match of the Day\")",
  "Sponsored Articles & Analysis",
  "Native advertising",
  "Social media promotion",
  "Telegram channel promotion",
  "Prediction Sponsor placement",
  "Mobile sticky ad",
];

const PACKAGES = [
  {
    name: "Basic",
    features: ["Homepage banner", "Logo placement", "Social mention"],
  },
  {
    name: "Match Sponsor",
    features: ["Match sponsorship", "Sponsor logo on match page", "Sponsored prediction card", "Match page placement"],
  },
  {
    name: "Premium",
    features: ["Homepage banner", "Sponsored match", "Sponsored article", "Social promotion", "Telegram promotion"],
    highlight: true,
  },
  {
    name: "Exclusive Partner",
    features: [
      "\"Official Partner\" placement",
      "Homepage visibility",
      "Match branding",
      "Video integration",
      "Social + Telegram promotion",
      "Analytics report",
    ],
  },
];

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export default async function AdvertisePage() {
  const settings = await getSiteSettings();
  const competitions = await getCompetitions();

  const stats = [
    { label: "Monthly Users", value: settings.monthlyUsers },
    { label: "Monthly Page Views", value: settings.monthlyPageViews },
    { label: "Telegram Audience", value: settings.telegramAudience },
    { label: "Social Reach", value: settings.socialReach },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-3 text-3xl font-black">Advertise with FutBetter</h1>
      <p className="mb-10 max-w-2xl text-sm text-muted">
        FutBetter reaches football fans through news, analysis, predictions and community voting. Partner with
        us to put your brand in front of an engaged, football-first audience.
      </p>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-bold">Our Audience</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-black text-brand">{formatNumber(s.value)}</p>
              <p className="mt-1 text-[11px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>
        {competitions.length > 0 && (
          <p className="mt-4 text-xs text-muted">
            Popular competitions we cover: {competitions.map((c) => c.name).join(", ")}.
          </p>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-bold">Advertising Formats</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {FORMATS.map((f) => (
            <div key={f} className="card px-4 py-3 text-sm">
              {f}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-bold">Partner Packages</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border p-5 ${p.highlight ? "border-brand bg-brand/5" : "border-border bg-surface"}`}
            >
              <h3 className="mb-3 font-black">{p.name}</h3>
              <ul className="space-y-1.5 text-xs text-muted">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand/40 bg-brand/5 p-8 text-center">
        <h2 className="mb-2 text-xl font-black">Let&apos;s work together</h2>
        <p className="mb-4 text-sm text-muted">
          Contact us to discuss packages, availability and custom campaigns.
        </p>
        <Link href="/contact" className="inline-block rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black">
          Contact Us
        </Link>
      </section>
    </div>
  );
}
