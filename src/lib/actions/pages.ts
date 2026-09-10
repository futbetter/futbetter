"use server";

import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { requireStaff } from "@/lib/auth-guards";
import { logAudit } from "@/lib/audit";
import { toSlug } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function savePage(formData: FormData) {
  const user = await requireStaff(["SUPER_ADMIN", "EDITOR"]);
  const id = str(formData, "id");
  const title = str(formData, "title");
  const contentMarkdown = str(formData, "contentMarkdown");
  if (!title || !contentMarkdown) throw new Error("Title and content are required");

  const slug = toSlug(str(formData, "slug") || title);
  const values = {
    title,
    slug,
    contentMarkdown,
    seoDescription: str(formData, "seoDescription") ?? null,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(pages).set(values).where(eq(pages.id, id));
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "page", entityId: id });
  } else {
    await db
      .insert(pages)
      .values(values)
      .onConflictDoUpdate({ target: pages.slug, set: values });
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPSERT", entityType: "page", entityId: slug });
  }

  revalidatePath(`/${slug}`);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
