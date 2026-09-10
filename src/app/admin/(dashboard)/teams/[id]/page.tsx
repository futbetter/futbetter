import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TeamForm } from "@/components/admin/TeamForm";
import { getCompetitions } from "@/lib/queries";

export const metadata = { title: "Edit Team" };

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [team] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!team) notFound();
  const competitions = await getCompetitions();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Edit Team</h1>
      <TeamForm team={team} competitions={competitions} />
    </div>
  );
}
