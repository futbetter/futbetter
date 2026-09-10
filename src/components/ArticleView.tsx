import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShareButtons } from "./ShareButtons";
import { VoteWidget } from "./VoteWidget";
import { getVoteTally } from "@/lib/actions/votes";
import { formatKickoff, isVotingLocked } from "@/lib/utils";
import { AdSlot } from "./AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://futbetter.com";

interface ArticleViewProps {
  article: {
    id: string;
    slug: string;
    type: "NEWS" | "ANALYSIS";
    title: string;
    subtitle?: string | null;
    coverImage?: string | null;
    contentMarkdown: string;
    category: string;
    tags?: string[] | null;
    publishAt?: Date | string | null;
    createdAt: Date | string;
    author?: { name: string | null } | null;
    showPredictionBox?: boolean;
    relatedMatch?: {
      id: string;
      slug: string;
      votingLocked: boolean;
      kickoffAt: Date | string;
      homeTeam: { name: string; logoUrl?: string | null; primaryColor?: string | null };
      awayTeam: { name: string; logoUrl?: string | null; primaryColor?: string | null };
    } | null;
  };
}

export async function ArticleView({ article }: ArticleViewProps) {
  const date = article.publishAt ?? article.createdAt;
  const basePath = article.type === "NEWS" ? "news" : "analysis";
  const tally = article.showPredictionBox && article.relatedMatch
    ? await getVoteTally(article.relatedMatch.id)
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-xs text-muted">
        <Link href={`/${basePath}`} className="hover:text-brand">
          {article.type === "NEWS" ? "News" : "Analysis"}
        </Link>{" "}
        / <span>{article.category}</span>
      </nav>

      <span className="mb-3 inline-block rounded bg-brand/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
        {article.category}
      </span>

      <h1 className="mb-3 text-3xl font-black leading-tight sm:text-4xl">{article.title}</h1>
      {article.subtitle && <p className="mb-4 text-lg text-muted">{article.subtitle}</p>}

      <div className="mb-6 flex items-center justify-between text-xs text-muted">
        <span>
          {article.author?.name ? `By ${article.author.name} — ` : ""}
          {formatKickoff(new Date(date))}
        </span>
      </div>

      {article.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImage}
          alt={article.title}
          className="mb-6 aspect-video w-full rounded-xl object-cover"
        />
      )}

      <AdSlot code="AD_ARTICLE_TOP" className="mb-6" />

      <div className="prose-fb">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.contentMarkdown}</ReactMarkdown>
      </div>

      {article.showPredictionBox && article.relatedMatch && tally && (
        <div className="my-8" id="predict">
          <h3 className="mb-3 text-lg font-bold">Who will win?</h3>
          <VoteWidget
            matchId={article.relatedMatch.id}
            homeTeam={article.relatedMatch.homeTeam}
            awayTeam={article.relatedMatch.awayTeam}
            initialTally={tally}
            locked={isVotingLocked(article.relatedMatch.votingLocked, article.relatedMatch.kickoffAt)}
          />
          <Link
            href={`/match/${article.relatedMatch.slug}`}
            className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
          >
            View full match page →
          </Link>
        </div>
      )}

      <AdSlot code="AD_ARTICLE_MIDDLE" className="my-8" />

      {article.tags && article.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span key={t} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-6">
        <ShareButtons url={`${SITE_URL}/${basePath}/${article.slug}`} title={article.title} />
      </div>

      <AdSlot code="AD_ARTICLE_BOTTOM" className="mt-8" />
    </article>
  );
}
