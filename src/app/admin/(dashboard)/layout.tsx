import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStaffRole, type Role } from "@/lib/roles";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || !isStaffRole(session.user.role)) {
    redirect("/admin/login");
  }

  return (
    <AdminShell userName={session.user.name} role={(session.user.role as Role) ?? "USER"}>
      {children}
    </AdminShell>
  );
}
