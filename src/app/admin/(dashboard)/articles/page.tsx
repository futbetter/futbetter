import Link from "next/link";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { deleteArticle, duplicateArticle, setArticleStatus } from "@/lib/actions/articles";

export const metadata = { title: "Articles" };

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-600",
  SCHEDULED: "bg-amber-600",
  PUBLISHED: "bg-brand text-black",
  UNPUBLISHED: "bg-red-600",
};

export default async function AdminArticlesPage() {
  const allArticles = await db.select().from(articles).orderBy(desc(articles.updatedAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Articles</h1>
        <Link href="/admin/articles/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black">
          <Plus size={16} /> New Article
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allArticles.map((a) => (
              <tr key={a.id} className="border-t border-border bg-surface hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/admin/articles/${a.id}`} className="font-medium hover:text-brand">
                    {a.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{a.type}</td>
                <td className="px-4 py-3 text-muted">{a.category}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{a.viewCount}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {a.status === "PUBLISHED" ? (
                      <form action={setArticleStatus.bind(null, a.id, "UNPUBLISHED")}>
                        <IconButton title="Unpublish"><EyeOff size={15} /></IconButton>
                      </form>
                    ) : (
                      <form action={setArticleStatus.bind(null, a.id, "PUBLISHED")}>
                        <IconButton title="Publish"><Eye size={15} /></IconButton>
                      </form>
                    )}
                    <form action={duplicateArticle.bind(null, a.id)}>
                      <IconButton title="Duplicate"><Copy size={15} /></IconButton>
                    </form>
                    <form action={deleteArticle.bind(null, a.id)}>
                      <IconButton title="Delete" danger><Trash2 size={15} /></IconButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {allArticles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No articles yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconButton({ children, title, danger }: { children: React.ReactNode; title: string; danger?: boolean }) {
  return (
    <button
      title={title}
      className={`rounded-md p-1.5 hover:bg-surface-2 ${danger ? "text-red-400" : "text-muted hover:text-brand"}`}
    >
      {children}
    </button>
  );
}
