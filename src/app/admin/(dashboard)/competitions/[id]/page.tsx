import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { competitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CompetitionForm } from "@/components/admin/CompetitionForm";

export const metadata = { title: "Edit Competition" };

export default async function EditCompetitionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [competition] = await db.select().from(competitions).where(eq(competitions.id, id)).limit(1);
  if (!competition) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Edit Competition</h1>
      <CompetitionForm competition={competition} />
    </div>
  );
}
