"use server";

import { db } from "@/lib/db";
import { partners, affiliateCampaigns } from "@/lib/db/schema";
import { requireStaff } from "@/lib/auth-guards";
import { logAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function savePartner(formData: FormData) {
  const user = await requireStaff();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const referralUrl = str(formData, "referralUrl");
  if (!name || !referralUrl) throw new Error("Partner name and referral URL are required");

  const startDateRaw = str(formData, "startDate");
  const endDateRaw = str(formData, "endDate");

  const values = {
    name,
    logo: str(formData, "logo") ?? null,
    description: str(formData, "description") ?? null,
    ctaText: str(formData, "ctaText") ?? "Learn more",
    referralUrl,
    trackingUrl: str(formData, "trackingUrl") ?? null,
    campaignId: str(formData, "campaignId") ?? null,
    country: str(formData, "country") ?? "Global",
    placement: str(formData, "placement") ?? "sidebar",
    packageTier: str(formData, "packageTier") ?? "BASIC",
    active: formData.get("active") === "on",
    startDate: startDateRaw ? new Date(startDateRaw) : null,
    endDate: endDateRaw ? new Date(endDateRaw) : null,
  };

  if (id) {
    await db.update(partners).set(values).where(eq(partners.id, id));
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "partner", entityId: id });
  } else {
    const [created] = await db.insert(partners).values(values).returning();
    await logAudit({ adminId: user.id, adminName: user.name, action: "CREATE", entityType: "partner", entityId: created.id });
  }

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deletePartner(id: string) {
  const user = await requireStaff();
  await db.delete(partners).where(eq(partners.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE", entityType: "partner", entityId: id });
  revalidatePath("/admin/partners");
}

export async function saveCampaign(formData: FormData) {
  const user = await requireStaff();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const trackingUrl = str(formData, "trackingUrl");
  const campaignCode = str(formData, "campaignCode");
  if (!name || !trackingUrl || !campaignCode) {
    throw new Error("Campaign name, tracking URL and campaign code are required");
  }

  const values = {
    name,
    partnerId: str(formData, "partnerId") ?? null,
    trackingUrl,
    campaignCode,
    placement: str(formData, "placement") ?? "homepage",
    country: str(formData, "country") ?? "Global",
    active: formData.get("active") === "on",
  };

  if (id) {
    await db.update(affiliateCampaigns).set(values).where(eq(affiliateCampaigns.id, id));
    await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "affiliate_campaign", entityId: id });
  } else {
    const [created] = await db.insert(affiliateCampaigns).values(values).returning();
    await logAudit({ adminId: user.id, adminName: user.name, action: "CREATE", entityType: "affiliate_campaign", entityId: created.id });
  }

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deleteCampaign(id: string) {
  const user = await requireStaff();
  await db.delete(affiliateCampaigns).where(eq(affiliateCampaigns.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE", entityType: "affiliate_campaign", entityId: id });
  revalidatePath("/admin/partners");
}
