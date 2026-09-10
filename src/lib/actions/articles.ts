"use server";

import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
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

function parseTags(input?: string): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function saveArticle(formData: FormData) {
  const user = await requireStaff();

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) throw new Error("Title is required");

  const type = (str(formData, "type") as "NEWS" | "ANALYSIS") ?? "NEWS";
  const status = (str(formData, "status") as "DRAFT" | "SCHEDULED" | "PUBLISHED" | "UNPUBLISHED") ?? "DRAFT";
  const slugInput = str(formData, "slug");
  const slug = toSlug(slugInput || title);
  const publishAtRaw = str(formData, "publishAt");

  const values = {
    title,
    subtitle: str(formData, "subtitle") ?? null,
    slug,
    type,
    coverImage: str(formData, "coverImage") ?? null,
    contentMarkdown: str(formData, "contentMarkdown") ?? "",
    category: str(formData, "category") ?? "Breaking News",
    tags: parseTags(str(formData, "tags")),
    status,
    publishAt: publishAtRaw ? new Date(publishAtRaw) : status === "PUBLISHED" ? new Date() : null,
    relatedMatchId: str(formData, "relatedMatchId") ?? null,
    relatedTeamId: str(formData, "relatedTeamId") ?? null,
    relatedCompetitionId: str(formData, "relatedCompetitionId") ?? null,
    seoTitle: str(formData, "seoTitle") ?? null,
    seoDescription: str(formData, "seoDescription") ?? null,
    socialImage: str(formData, "socialImage") ?? null,
    showPredictionBox: formData.get("showPredictionBox") === "on",
    updatedAt: new Date(),
  };

  let articleId = id;

  if (id) {
    await db.update(articles).set(values).where(eq(articles.id, id));
    await logAudit({
      adminId: user.id,
      adminName: user.name,
      action: "UPDATE",
      entityType: "article",
      entityId: id,
      details: { title, status },
    });
  } else {
    const [created] = await db
      .insert(articles)
      .values({ ...values, authorId: user.id })
      .returning();
    articleId = created.id;
    await logAudit({
      adminId: user.id,
      adminName: user.name,
      action: "CREATE",
      entityType: "article",
      entityId: created.id,
      details: { title, status },
    });
  }

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/analysis");
  revalidatePath("/admin/articles");
  if (slug) revalidatePath(`/${type === "NEWS" ? "news" : "analysis"}/${slug}`);

  redirect(`/admin/articles/${articleId}`);
}

export async function deleteArticle(id: string) {
  const user = await requireStaff();
  await db.delete(articles).where(eq(articles.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE", entityType: "article", entityId: id });
  revalidatePath("/admin/articles");
  revalidatePath("/news");
  revalidatePath("/analysis");
}

export async function duplicateArticle(id: string) {
  const user = await requireStaff();
  const [original] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!original) throw new Error("Article not found");

  const [copy] = await db
    .insert(articles)
    .values({
      ...original,
      id: undefined,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString(36)}`,
      status: "DRAFT",
      publishAt: null,
      viewCount: 0,
      createdAt: undefined,
      updatedAt: undefined,
    })
    .returning();

  await logAudit({ adminId: user.id, adminName: user.name, action: "DUPLICATE", entityType: "article", entityId: copy.id });
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${copy.id}`);
}

export async function setArticleStatus(id: string, status: "PUBLISHED" | "UNPUBLISHED" | "DRAFT") {
  const user = await requireStaff();
  await db
    .update(articles)
    .set({ status, publishAt: status === "PUBLISHED" ? new Date() : undefined, updatedAt: new Date() })
    .where(eq(articles.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: `SET_STATUS_${status}`, entityType: "article", entityId: id });
  revalidatePath("/admin/articles");
  revalidatePath("/news");
  revalidatePath("/analysis");
  revalidatePath("/");
}
