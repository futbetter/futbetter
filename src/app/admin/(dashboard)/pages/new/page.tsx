import { PageForm } from "@/components/admin/PageForm";
import { DEFAULT_PAGES } from "@/lib/default-pages";

export const metadata = { title: "New Page" };

export default async function NewPagePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const preset = slug ? DEFAULT_PAGES.find((p) => p.slug === slug) : undefined;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">New Page</h1>
      <PageForm page={preset ? { id: "", ...preset } : undefined} />
    </div>
  );
}
