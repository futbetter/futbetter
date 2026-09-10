import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { banUser, unbanUser } from "@/lib/actions/users";
import { auth } from "@/lib/auth";
import { accuracy } from "@/lib/utils";
import { RoleSelect } from "@/components/admin/RoleSelect";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Users</h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Telegram</th>
              <th className="px-4 py-3">Predictions</th>
              <th className="px-4 py-3">Accuracy</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr key={u.id} className="border-t border-border bg-surface">
                <td className="px-4 py-3">
                  <span className="font-medium">{u.name}</span>
                  {u.banned && <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold">BANNED</span>}
                </td>
                <td className="px-4 py-3 text-muted">{u.telegramUsername ? `@${u.telegramUsername}` : "—"}</td>
                <td className="px-4 py-3 text-muted">{u.totalPredictions}</td>
                <td className="px-4 py-3 text-muted">{accuracy(u.correctPredictions, u.totalPredictions)}%</td>
                <td className="px-4 py-3">
                  {isSuperAdmin ? (
                    <RoleSelect userId={u.id} currentRole={u.role} />
                  ) : (
                    <span className="text-xs text-muted">{u.role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {u.banned ? (
                      <form action={unbanUser.bind(null, u.id)}>
                        <button className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-semibold hover:text-brand">Unban</button>
                      </form>
                    ) : (
                      <form action={banUser.bind(null, u.id, "Violated community rules")}>
                        <button className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10">Ban</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {allUsers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
