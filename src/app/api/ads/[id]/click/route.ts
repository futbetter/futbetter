import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adSlots } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const [ad] = await db.select().from(adSlots).where(eq(adSlots.id, id)).limit(1);
  if (!ad || !ad.url) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  await db
    .update(adSlots)
    .set({ clicks: sql`${adSlots.clicks} + 1` })
    .where(eq(adSlots.id, id));

  return NextResponse.redirect(ad.url);
}
