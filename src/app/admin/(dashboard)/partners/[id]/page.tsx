import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { partners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PartnerForm } from "@/components/admin/PartnerForm";

export const metadata = { title: "Edit Partner" };

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [partner] = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  if (!partner) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Edit Partner</h1>
      <PartnerForm partner={partner} />
    </div>
  );
}
