// Shared role constants — safe to import from both client and server code.
export const ADMIN_ROLE_LIST = [
  "SUPER_ADMIN",
  "EDITOR",
  "WRITER",
  "MODERATOR",
  "AD_MANAGER",
  "ANALYST",
] as const;

export type AdminRole = (typeof ADMIN_ROLE_LIST)[number];
export type Role = AdminRole | "USER";

export function isStaffRole(role?: string | null): boolean {
  return !!role && (ADMIN_ROLE_LIST as readonly string[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  EDITOR: "Editor",
  WRITER: "Writer",
  MODERATOR: "Moderator",
  AD_MANAGER: "Ad Manager",
  ANALYST: "Analyst",
  USER: "User",
};
