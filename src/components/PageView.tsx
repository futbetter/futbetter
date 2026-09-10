import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function PageView({ title, contentMarkdown }: { title: string; contentMarkdown: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-black">{title}</h1>
      <div className="prose-fb">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentMarkdown}</ReactMarkdown>
      </div>
    </div>
  );
}
