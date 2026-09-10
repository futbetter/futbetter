import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { PageView } from "@/components/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("cookies");
  return { title: page?.title ?? "Cookie Policy", description: page?.seoDescription ?? undefined };
}

export default async function CookiesPage() {
  const page = await getPageBySlug("cookies");
  if (!page) notFound();
  return <PageView title={page.title} contentMarkdown={page.contentMarkdown} />;
}
