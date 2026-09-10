import Link from "next/link";
import { formatKickoff } from "@/lib/utils";

export interface ArticleCardData {
  slug: string;
  type: "NEWS" | "ANALYSIS";
  title: string;
  subtitle?: string | null;
  coverImage?: string | null;
  category: string;
  publishAt?: string | Date | null;
  createdAt: string | Date;
}

export function ArticleCard({ article, size = "default" }: { article: ArticleCardData; size?: "default" | "large" }) {
  const href = `/${article.type === "NEWS" ? "news" : "analysis"}/${article.slug}`;
  const date = article.publishAt ?? article.createdAt;

  return (
    <Link href={href} className="group block overflow-hidden rounded-xl border border-border bg-surface">
      <div
        className={`relative w-full overflow-hidden bg-surface-2 ${size === "large" ? "aspect-[16/9]" : "aspect-[16/10]"}`}
      >
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-black text-border">
            FB
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
          {article.category}
        </span>
      </div>
      <div className="p-3.5">
        <h3
          className={`font-bold leading-snug group-hover:text-brand ${
            size === "large" ? "text-lg" : "text-sm"
          }`}
        >
          {article.title}
        </h3>
        {article.subtitle && size === "large" && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{article.subtitle}</p>
        )}
        <p className="mt-2 text-[11px] text-muted">{formatKickoff(new Date(date))}</p>
      </div>
    </Link>
  );
}
