import { getPendingComments, getOpenReports } from "@/lib/admin-queries";
import { approveComment, hideComment, deleteCommentAdmin, resolveReport } from "@/lib/actions/users";

export const metadata = { title: "Moderation" };

export default async function ModerationPage() {
  const [pendingComments, openReports] = await Promise.all([getPendingComments(), getOpenReports()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-2 text-2xl font-black">Moderation</h1>
        <p className="text-sm text-muted">Comments and reports awaiting review.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Pending Comments</h2>
        <div className="space-y-2">
          {pendingComments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm">{c.content}</p>
              <div className="mt-2 flex gap-2">
                <form action={approveComment.bind(null, c.id)}>
                  <button className="rounded-md bg-brand px-2.5 py-1 text-xs font-bold text-black">Approve</button>
                </form>
                <form action={hideComment.bind(null, c.id)}>
                  <button className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-semibold">Hide</button>
                </form>
                <form action={deleteCommentAdmin.bind(null, c.id)}>
                  <button className="rounded-md bg-red-600/20 px-2.5 py-1 text-xs font-semibold text-red-400">Delete</button>
                </form>
              </div>
            </div>
          ))}
          {pendingComments.length === 0 && <p className="text-sm text-muted">Nothing pending.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Open Reports</h2>
        <div className="space-y-2">
          {openReports.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm">
                <span className="font-semibold">{r.targetType}</span> — {r.reason}
              </p>
              <div className="mt-2 flex gap-2">
                <form action={resolveReport.bind(null, r.id, "RESOLVED")}>
                  <button className="rounded-md bg-brand px-2.5 py-1 text-xs font-bold text-black">Resolve</button>
                </form>
                <form action={resolveReport.bind(null, r.id, "DISMISSED")}>
                  <button className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-semibold">Dismiss</button>
                </form>
              </div>
            </div>
          ))}
          {openReports.length === 0 && <p className="text-sm text-muted">No open reports.</p>}
        </div>
      </section>
    </div>
  );
}
