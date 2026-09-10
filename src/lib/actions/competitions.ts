"use server";

import { db } from "@/lib/db";
import { competitions } from "@/lib/db/schema";
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

export async function saveCompetition(formData: FormData) {
  const user = await requireStaff();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Competition name is required");

  const values = {
    name,
    slug: toSlug(str(formData, "slug") || name),
    country: str(formData, "country") ?? null,
    type: str(formData, "type") ?? "league",
    season: str(formData, "season") ?? null,
    logoUrl: str(formData, "logoUrl") ?? null,
    description: str(formData, "description") ?? null,
  };

  if (id) {
    await db.update(competitions).set(values).where(eq(competitions.id, id));
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "competition", entityId: id });
  } else {
    const [created] = await db.insert(competitions).values(values).returning();
    await logAudit({ adminId: user.id, adminName: user.name, action: "CREATE", entityType: "competition", entityId: created.id });
  }

  revalidatePath("/admin/competitions");
  redirect("/admin/competitions");
}

export async function deleteCompetition(id: string) {
  const user = await requireStaff();
  await db.delete(competitions).where(eq(competitions.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE", entityType: "competition", entityId: id });
  revalidatePath("/admin/competitions");
}
