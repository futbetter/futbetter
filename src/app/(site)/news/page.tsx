import type { Metadata } from "next";
import { getArticles } from "@/lib/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Football News",
  description: "Breaking football news, transfers and club updates across every major league.",
};

const CATEGORIES = [
  "Breaking News",
  "Transfers",
  "Premier League",
  "Champions League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "National Teams",
  "Injuries",
];

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const news = await getArticles({ type: "NEWS", category, limit: 24 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-black">News</h1>
      <p className="mb-6 text-sm text-muted">Breaking football news, transfers and club updates.</p>

      <div className="mb-6 flex flex-wrap gap-2">
        <CategoryPill label="All" active={!category} href="/news" />
        {CATEGORIES.map((c) => (
          <CategoryPill key={c} label={c} active={category === c} href={`/news?category=${encodeURIComponent(c)}`} />
        ))}
      </div>

      <AdSlot code="AD_ARTICLE_TOP" className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((a) => (
          <ArticleCard key={a.id} article={{ ...a, publishAt: a.publishAt?.toString() }} />
        ))}
        {news.length === 0 && <p className="text-sm text-muted">No articles in this category yet.</p>}
      </div>
    </div>
  );
}

function CategoryPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`tag transition ${
        active ? "tag-brand" : "hover:border-brand/50 hover:text-brand"
      }`}
    >
      {label}
    </a>
  );
}
