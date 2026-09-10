import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, incrementArticleView } from "@/lib/queries";
import { ArticleView } from "@/components/ArticleView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://futbetter.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.type !== "NEWS") return {};

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.subtitle || undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/news/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: article.socialImage || article.coverImage ? [article.socialImage || article.coverImage!] : undefined,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.type !== "NEWS" || article.status !== "PUBLISHED") notFound();

  incrementArticleView(article.id).catch(() => {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.subtitle ?? undefined,
    image: article.coverImage ?? undefined,
    datePublished: (article.publishAt ?? article.createdAt).toString(),
    author: article.author?.name ? { "@type": "Person", name: article.author.name } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleView article={article} />
    </>
  );
}
