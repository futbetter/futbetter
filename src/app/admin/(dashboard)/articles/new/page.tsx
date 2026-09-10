import { ArticleForm } from "@/components/admin/ArticleForm";
import { getMatchOptions } from "@/lib/admin-queries";
import { getTeams, getCompetitions } from "@/lib/queries";

export const metadata = { title: "New Article" };

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [matches, teams, competitions] = await Promise.all([getMatchOptions(), getTeams(), getCompetitions()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">New Article</h1>
      <ArticleForm
        defaultType={type === "ANALYSIS" ? "ANALYSIS" : "NEWS"}
        matches={matches}
        teams={teams}
        competitions={competitions}
      />
    </div>
  );
}
