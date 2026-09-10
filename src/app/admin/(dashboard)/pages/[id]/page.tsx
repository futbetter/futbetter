import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageForm } from "@/components/admin/PageForm";

export const metadata = { title: "Edit Page" };

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Edit Page</h1>
      <PageForm page={page} />
    </div>
  );
}
