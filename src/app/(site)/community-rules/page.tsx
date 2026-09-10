import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { PageView } from "@/components/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("community-rules");
  return { title: page?.title ?? "Community Rules", description: page?.seoDescription ?? undefined };
}

export default async function CommunityRulesPage() {
  const page = await getPageBySlug("community-rules");
  if (!page) notFound();
  return <PageView title={page.title} contentMarkdown={page.contentMarkdown} />;
}
