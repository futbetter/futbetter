"use client";

import { useTransition } from "react";
import { setUserRole } from "@/lib/actions/users";
import { ADMIN_ROLE_LIST, type Role } from "@/lib/roles";

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentRole}
      disabled={isPending}
      onChange={(e) => {
        const role = e.target.value as Role;
        startTransition(() => setUserRole(userId, role));
      }}
      className="input py-1 text-xs"
    >
      <option value="USER">User</option>
      {ADMIN_ROLE_LIST.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
