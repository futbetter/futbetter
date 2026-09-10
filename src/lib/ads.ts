import { db } from "@/lib/db";
import { adSlots } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getActiveAd(code: string) {
  const [ad] = await db.select().from(adSlots).where(eq(adSlots.code, code)).limit(1);
  if (!ad || !ad.enabled) return null;

  const now = Date.now();
  if (ad.startDate && now < new Date(ad.startDate).getTime()) return null;
  if (ad.endDate && now > new Date(ad.endDate).getTime()) return null;

  // best-effort impression tracking, non-blocking
  db.update(adSlots)
    .set({ impressions: sql`${adSlots.impressions} + 1` })
    .where(eq(adSlots.id, ad.id))
    .catch(() => {});

  return ad;
}

export const AD_SLOT_CODES = [
  "AD_HOME_TOP",
  "AD_HOME_MIDDLE",
  "AD_HOME_SIDEBAR",
  "AD_ARTICLE_TOP",
  "AD_ARTICLE_MIDDLE",
  "AD_ARTICLE_BOTTOM",
  "AD_MATCH_TOP",
  "AD_MATCH_SIDEBAR",
  "AD_MATCH_BOTTOM",
  "AD_MOBILE_STICKY",
  "AD_FOOTER",
] as const;
