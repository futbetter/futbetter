import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { PageView } from "@/components/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("affiliate-disclosure");
  return { title: page?.title ?? "Affiliate Disclosure", description: page?.seoDescription ?? undefined };
}

export default async function AffiliateDisclosurePage() {
  const page = await getPageBySlug("affiliate-disclosure");
  if (!page) notFound();
  return <PageView title={page.title} contentMarkdown={page.contentMarkdown} />;
}
