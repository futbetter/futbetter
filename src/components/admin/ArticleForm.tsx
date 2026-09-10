"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveArticle } from "@/lib/actions/articles";
import { toSlug } from "@/lib/utils";

const CATEGORIES = [
  "Breaking News",
  "Transfers",
  "Premier League",
  "Champions League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Europa League",
  "Conference League",
  "National Teams",
  "Injuries",
  "Managers",
  "Club News",
  "Players",
];

interface ArticleFormProps {
  article?: {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    type: "NEWS" | "ANALYSIS";
    coverImage?: string | null;
    contentMarkdown: string;
    category: string;
    tags?: string[] | null;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "UNPUBLISHED";
    publishAt?: Date | string | null;
    relatedMatchId?: string | null;
    relatedTeamId?: string | null;
    relatedCompetitionId?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    socialImage?: string | null;
    showPredictionBox?: boolean;
  };
  defaultType?: "NEWS" | "ANALYSIS";
  matches: { id: string; label: string }[];
  teams: { id: string; name: string }[];
  competitions: { id: string; name: string }[];
}

export function ArticleForm({ article, defaultType, matches, teams, competitions }: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [content, setContent] = useState(article?.contentMarkdown ?? "");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <form action={saveArticle} className="space-y-6">
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(toSlug(e.target.value));
            }}
            className="input"
          />
        </Field>
        <Field label="Slug">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="input"
          />
        </Field>
      </div>

      <Field label="Subtitle">
        <input name="subtitle" defaultValue={article?.subtitle ?? ""} className="input" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Type">
          <select name="type" defaultValue={article?.type ?? defaultType ?? "NEWS"} className="input">
            <option value="NEWS">News</option>
            <option value="ANALYSIS">Analysis</option>
          </select>
        </Field>
        <Field label="Category">
          <select name="category" defaultValue={article?.category ?? "Breaking News"} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={article?.status ?? "DRAFT"} className="input">
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
          </select>
        </Field>
      </div>

      <Field label="Publish at (leave blank for immediate on publish)">
        <input
          type="datetime-local"
          name="publishAt"
          defaultValue={article?.publishAt ? new Date(article.publishAt).toISOString().slice(0, 16) : ""}
          className="input"
        />
      </Field>

      <Field label="Cover image URL">
        <input name="coverImage" defaultValue={article?.coverImage ?? ""} placeholder="https://…" className="input" />
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-semibold text-muted">Content (Markdown)</label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>
        <textarea
          name="contentMarkdown"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="input font-mono text-sm"
          placeholder="Write your article in Markdown…"
        />
        {showPreview && (
          <div className="prose-fb mt-3 rounded-lg border border-border bg-surface-2 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Nothing to preview yet.*"}</ReactMarkdown>
          </div>
        )}
      </div>

      <Field label="Tags (comma separated)">
        <input name="tags" defaultValue={article?.tags?.join(", ") ?? ""} className="input" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Related Match">
          <select name="relatedMatchId" defaultValue={article?.relatedMatchId ?? ""} className="input">
            <option value="">None</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Related Team">
          <select name="relatedTeamId" defaultValue={article?.relatedTeamId ?? ""} className="input">
            <option value="">None</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Related Competition">
          <select name="relatedCompetitionId" defaultValue={article?.relatedCompetitionId ?? ""} className="input">
            <option value="">None</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="showPredictionBox" defaultChecked={article?.showPredictionBox} className="h-4 w-4" />
        Show interactive &quot;Who will win?&quot; prediction box (requires a related match)
      </label>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">SEO</legend>
        <div className="space-y-4">
          <Field label="SEO Title">
            <input name="seoTitle" defaultValue={article?.seoTitle ?? ""} className="input" />
          </Field>
          <Field label="SEO Description">
            <textarea name="seoDescription" defaultValue={article?.seoDescription ?? ""} rows={2} className="input" />
          </Field>
          <Field label="Social share image URL">
            <input name="socialImage" defaultValue={article?.socialImage ?? ""} className="input" />
          </Field>
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
        <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
          Save Article
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
    </label>
  );
}
