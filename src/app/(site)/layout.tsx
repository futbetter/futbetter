import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { getSiteSettings } from "@/lib/settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://futbetter.com";

// FutBetter is entirely database-driven (live votes, sessions, admin-edited
// content), so we render everything dynamically rather than attempting
// static generation.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${settings.siteName} — ${settings.slogan}`,
      template: `%s | ${settings.siteName}`,
    },
    description:
      "FutBetter is a football media platform with news, tactical analysis, FutBetter predictions, and community voting on every major match.",
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title: `${settings.siteName} — ${settings.slogan}`,
      description: settings.heroText,
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.siteName} — ${settings.slogan}`,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
