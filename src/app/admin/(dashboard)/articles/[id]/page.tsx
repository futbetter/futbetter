import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getMatchOptions } from "@/lib/admin-queries";
import { getTeams, getCompetitions } from "@/lib/queries";

export const metadata = { title: "Edit Article" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!article) notFound();

  const [matches, teams, competitions] = await Promise.all([getMatchOptions(), getTeams(), getCompetitions()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Edit Article</h1>
      <ArticleForm article={article} matches={matches} teams={teams} competitions={competitions} />
    </div>
  );
}
