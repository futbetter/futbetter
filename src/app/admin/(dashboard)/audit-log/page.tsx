import { getRecentAuditLogs } from "@/lib/admin-queries";

export const metadata = { title: "Audit Log" };

export default async function AuditLogPage() {
  const logs = await getRecentAuditLogs(100);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Audit Log</h1>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border bg-surface">
                <td className="px-4 py-3 font-medium">{log.adminName ?? "System"}</td>
                <td className="px-4 py-3 text-muted">{log.action}</td>
                <td className="px-4 py-3 text-muted">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(log.createdAt).toLocaleString("en-GB")}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No activity recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
