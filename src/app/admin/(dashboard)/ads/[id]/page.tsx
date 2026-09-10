import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { adSlots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AdSlotForm } from "@/components/admin/AdSlotForm";

export const metadata = { title: "Edit Ad Slot" };

export default async function EditAdSlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [adSlot] = await db.select().from(adSlots).where(eq(adSlots.id, id)).limit(1);
  if (!adSlot) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Edit Ad Slot</h1>
      <AdSlotForm adSlot={adSlot} />
    </div>
  );
}
