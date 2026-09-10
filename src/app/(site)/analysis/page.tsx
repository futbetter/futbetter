import type { Metadata } from "next";
import { getArticles } from "@/lib/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Match Analysis",
  description: "In-depth tactical previews, head-to-head stats and FutBetter predictions for the biggest matches.",
};

export default async function AnalysisPage() {
  const analysis = await getArticles({ type: "ANALYSIS", limit: 24 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-black">Analysis</h1>
      <p className="mb-6 text-sm text-muted">
        Tactical previews, form guides, key players and FutBetter&apos;s predicted outcome for every big match.
      </p>

      <AdSlot code="AD_ARTICLE_TOP" className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {analysis.map((a) => (
          <ArticleCard key={a.id} article={{ ...a, publishAt: a.publishAt?.toString() }} size="large" />
        ))}
        {analysis.length === 0 && <p className="text-sm text-muted">No analysis published yet.</p>}
      </div>
    </div>
  );
}
