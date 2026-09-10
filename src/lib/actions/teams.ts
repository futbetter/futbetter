"use server";

import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
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
function num(fd: FormData, key: string): number | undefined {
  const v = str(fd, key);
  return v === undefined ? undefined : Number(v);
}

export async function saveTeam(formData: FormData) {
  const user = await requireStaff();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Team name is required");

  const values = {
    name,
    shortName: str(formData, "shortName") ?? null,
    slug: toSlug(str(formData, "slug") || name),
    country: str(formData, "country") ?? null,
    logoUrl: str(formData, "logoUrl") ?? null,
    primaryColor: str(formData, "primaryColor") ?? "#22c55e",
    secondaryColor: str(formData, "secondaryColor") ?? "#111111",
    competitionId: str(formData, "competitionId") ?? null,
    foundedYear: num(formData, "foundedYear") ?? null,
    description: str(formData, "description") ?? null,
    website: str(formData, "website") ?? null,
  };

  if (id) {
    await db.update(teams).set(values).where(eq(teams.id, id));
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "team", entityId: id });
  } else {
    const [created] = await db.insert(teams).values(values).returning();
    await logAudit({ adminId: user.id, adminName: user.name, action: "CREATE", entityType: "team", entityId: created.id });
  }

  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}

export async function deleteTeam(id: string) {
  const user = await requireStaff();
  await db.delete(teams).where(eq(teams.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE", entityType: "team", entityId: id });
  revalidatePath("/admin/teams");
}
