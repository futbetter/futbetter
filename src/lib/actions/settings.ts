"use server";

import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { requireStaff } from "@/lib/auth-guards";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}
function num(fd: FormData, key: string): number {
  const v = str(fd, key);
  return v ? Number(v) : 0;
}

export async function saveSiteSettings(formData: FormData) {
  const user = await requireStaff(["SUPER_ADMIN"]);

  const values = {
    siteName: str(formData, "siteName") ?? "FutBetter",
    slogan: str(formData, "slogan") ?? "Football. Analysis. Predictions.",
    heroText: str(formData, "heroText") ?? "Better Football Insights.",
    contactEmail: str(formData, "contactEmail") ?? "futbetterofficial@gmail.com",
    socialTelegram: str(formData, "socialTelegram") ?? "https://t.me/futbetter_official",
    socialTiktok: str(formData, "socialTiktok") ?? "https://www.tiktok.com/@futbetter_official",
    socialInstagram: str(formData, "socialInstagram") ?? "https://www.instagram.com/futbetter_official",
    socialX: str(formData, "socialX") ?? "https://x.com/futbetter_off",
    telegramBotUsername: str(formData, "telegramBotUsername") ?? "futbetterlogin_bot",
    monthlyUsers: num(formData, "monthlyUsers"),
    monthlyPageViews: num(formData, "monthlyPageViews"),
    telegramAudience: num(formData, "telegramAudience"),
    socialReach: num(formData, "socialReach"),
    updatedAt: new Date(),
  };

  await db
    .insert(siteSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values });

  await logAudit({ adminId: user.id, adminName: user.name, action: "UPDATE", entityType: "site_settings" });

  revalidatePath("/", "layout");
}
