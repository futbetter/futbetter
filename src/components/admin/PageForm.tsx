"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { savePage } from "@/lib/actions/pages";

interface PageFormProps {
  page?: {
    id: string;
    title: string;
    slug: string;
    contentMarkdown: string;
    seoDescription?: string | null;
  };
}

export function PageForm({ page }: PageFormProps) {
  const [content, setContent] = useState(page?.contentMarkdown ?? "");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <form action={savePage} className="space-y-4">
      {page && <input type="hidden" name="id" value={page.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Title *</span>
          <input name="title" required defaultValue={page?.title ?? ""} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Slug (URL path)</span>
          <input name="slug" defaultValue={page?.slug ?? ""} placeholder="e.g. privacy" className="input" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">SEO description</span>
        <textarea name="seoDescription" defaultValue={page?.seoDescription ?? ""} rows={2} className="input" />
      </label>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-semibold text-muted">Content (Markdown) *</label>
          <button type="button" onClick={() => setShowPreview((v) => !v)} className="text-xs font-semibold text-brand hover:underline">
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>
        <textarea
          name="contentMarkdown"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="input font-mono text-sm"
        />
        {showPreview && (
          <div className="prose-fb mt-3 rounded-lg border border-border bg-surface-2 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
          Save Page
        </button>
      </div>
    </form>
  );
}
