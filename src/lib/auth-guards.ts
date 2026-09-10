import "server-only";
import { auth } from "@/lib/auth";
import { ADMIN_ROLE_LIST, type AdminRole } from "@/lib/roles";

export class AuthError extends Error {}

/**
 * Ensures the current session belongs to a staff member. Throws if not —
 * callers (server actions) should let this propagate so the form shows an
 * error rather than silently doing nothing.
 */
export async function requireStaff(allowed: readonly AdminRole[] = ADMIN_ROLE_LIST) {
  const session = await auth();
  const role = session?.user?.role as AdminRole | undefined;
  if (!session?.user || !role || !allowed.includes(role)) {
    throw new AuthError("Not authorized");
  }
  return session.user;
}
