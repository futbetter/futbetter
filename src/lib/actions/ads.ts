"use server";

import { db } from "@/lib/db";
import { adSlots } from "@/lib/db/schema";
import { requireStaff } from "@/lib/auth-guards";
import { logAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function saveAdSlot(formData: FormData) {
  const user = await requireStaff();
  const id = str(formData, "id");
  const code = str(formData, "code");
  const name = str(formData, "name");
  if (!code || !name) throw new Error("Slot code and name are required");

  const startDateRaw = str(formData, "startDate");
  const endDateRaw = str(formData, "endDate");

  const values = {
    code: code.toUpperCase().replace(/\s+/g, "_"),
    name,
    enabled: formData.get("enabled") === "on",
    format: str(formData, "format") ?? "banner",
    desktopImageUrl: str(formData, "desktopImageUrl") ?? null,
    mobileImageUrl: str(formData, "mobileImageUrl") ?? null,
    html: str(formData, "html") ?? null,
    url: str(formData, "url") ?? null,
    startDate: startDateRaw ? new Date(startDateRaw) : null,
    endDate: endDateRaw ? new Date(endDateRaw) : null,
  };

  if (id) {
    await db.update(adSlots).set(values).where(eq(adSlots.id, id));
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "ad_slot", entityId: id });
  } else {
    const [created] = await db.insert(adSlots).values(values).returning();
    await logAudit({ adminId: user.id, adminName: user.name, action: "CREATE", entityType: "ad_slot", entityId: created.id });
  }

  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

export async function deleteAdSlot(id: string) {
  const user = await requireStaff();
  await db.delete(adSlots).where(eq(adSlots.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE", entityType: "ad_slot", entityId: id });
  revalidatePath("/admin/ads");
}

export async function toggleAdSlot(id: string, enabled: boolean) {
  await requireStaff();
  await db.update(adSlots).set({ enabled }).where(eq(adSlots.id, id));
  revalidatePath("/admin/ads");
}
