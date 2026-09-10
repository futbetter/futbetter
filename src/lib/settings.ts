import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type SiteSettings = typeof siteSettings.$inferSelect;

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  siteName: "FutBetter",
  slogan: "Football. Analysis. Predictions.",
  heroText: "Better Football Insights.",
  contactEmail: "futbetterofficial@gmail.com",
  socialTelegram: "https://t.me/futbetter_official",
  socialTiktok: "https://www.tiktok.com/@futbetter_official",
  socialInstagram: "https://www.instagram.com/futbetter_official",
  socialX: "https://x.com/futbetter_off",
  telegramBotUsername: "futbetterlogin_bot",
  monthlyUsers: 0,
  monthlyPageViews: 0,
  telegramAudience: 0,
  socialReach: 0,
  updatedAt: new Date(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
    return row ?? DEFAULT_SETTINGS;
  } catch (e) {
    console.error("[settings] falling back to defaults:", e);
    return DEFAULT_SETTINGS;
  }
}
