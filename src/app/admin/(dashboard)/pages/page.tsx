import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllPages } from "@/lib/queries";
import { DEFAULT_PAGES } from "@/lib/default-pages";

export const metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const dbPages = await getAllPages();
  const dbSlugs = new Set(dbPages.map((p) => p.slug));
  const notYetCustomized = DEFAULT_PAGES.filter((p) => !dbSlugs.has(p.slug));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Pages</h1>
        <Link href="/admin/pages/new" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black">
          <Plus size={16} /> New Page
        </Link>
      </div>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Customized</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dbPages.map((p) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className="rounded-xl border border-border bg-surface p-4 hover:border-brand/50">
            <p className="font-semibold">{p.title}</p>
            <p className="text-xs text-muted">/{p.slug}</p>
          </Link>
        ))}
        {dbPages.length === 0 && <p className="text-sm text-muted">No pages customized yet — defaults are shown live on the site.</p>}
      </div>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Using Default Content</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notYetCustomized.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/pages/new?slug=${p.slug}`}
            className="rounded-xl border border-dashed border-border bg-surface/50 p-4 hover:border-brand/50"
          >
            <p className="font-semibold text-muted">{p.title}</p>
            <p className="text-xs text-muted">/{p.slug} — click to customize</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
