import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { PageView } from "@/components/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("privacy");
  return { title: page?.title ?? "Privacy Policy", description: page?.seoDescription ?? undefined };
}

export default async function PrivacyPage() {
  const page = await getPageBySlug("privacy");
  if (!page) notFound();
  return <PageView title={page.title} contentMarkdown={page.contentMarkdown} />;
}
