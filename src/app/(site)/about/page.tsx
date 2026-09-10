import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { PageView } from "@/components/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  return { title: page?.title ?? "About", description: page?.seoDescription ?? undefined };
}

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  if (!page) notFound();
  return <PageView title={page.title} contentMarkdown={page.contentMarkdown} />;
}
