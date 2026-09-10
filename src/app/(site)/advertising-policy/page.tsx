import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries";
import { PageView } from "@/components/PageView";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("advertising-policy");
  return { title: page?.title ?? "Advertising Policy", description: page?.seoDescription ?? undefined };
}

export default async function AdvertisingPolicyPage() {
  const page = await getPageBySlug("advertising-policy");
  if (!page) notFound();
  return <PageView title={page.title} contentMarkdown={page.contentMarkdown} />;
}
