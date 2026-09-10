import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { PageView } from "@/components/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("terms");
  return { title: page?.title ?? "Terms of Use", description: page?.seoDescription ?? undefined };
}

export default async function TermsPage() {
  const page = await getPageBySlug("terms");
  if (!page) notFound();
  return <PageView title={page.title} contentMarkdown={page.contentMarkdown} />;
}
