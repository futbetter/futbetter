"use server";

import { db } from "@/lib/db";
import { users, comments, reports } from "@/lib/db/schema";
import { requireStaff } from "@/lib/auth-guards";
import { logAudit } from "@/lib/audit";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/roles";

export async function banUser(id: string, reason?: string) {
  const user = await requireStaff(["SUPER_ADMIN", "MODERATOR"]);
  await db.update(users).set({ banned: true, banReason: reason ?? null }).where(eq(users.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "BAN_USER", entityType: "user", entityId: id, details: { reason } });
  revalidatePath("/admin/users");
}

export async function unbanUser(id: string) {
  const user = await requireStaff(["SUPER_ADMIN", "MODERATOR"]);
  await db.update(users).set({ banned: false, banReason: null }).where(eq(users.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "UNBAN_USER", entityType: "user", entityId: id });
  revalidatePath("/admin/users");
}

export async function setUserRole(id: string, role: Role) {
  const user = await requireStaff(["SUPER_ADMIN"]);
  await db.update(users).set({ role }).where(eq(users.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "SET_ROLE", entityType: "user", entityId: id, details: { role } });
  revalidatePath("/admin/users");
}

export async function hideComment(id: string) {
  const user = await requireStaff(["SUPER_ADMIN", "MODERATOR"]);
  await db.update(comments).set({ status: "HIDDEN" }).where(eq(comments.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "HIDE_COMMENT", entityType: "comment", entityId: id });
  revalidatePath("/admin/moderation");
}

export async function approveComment(id: string) {
  const user = await requireStaff(["SUPER_ADMIN", "MODERATOR"]);
  await db.update(comments).set({ status: "APPROVED" }).where(eq(comments.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "APPROVE_COMMENT", entityType: "comment", entityId: id });
  revalidatePath("/admin/moderation");
}

export async function deleteCommentAdmin(id: string) {
  const user = await requireStaff(["SUPER_ADMIN", "MODERATOR"]);
  await db.update(comments).set({ status: "DELETED" }).where(eq(comments.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: "DELETE_COMMENT", entityType: "comment", entityId: id });
  revalidatePath("/admin/moderation");
}

export async function resolveReport(id: string, status: "RESOLVED" | "DISMISSED") {
  const user = await requireStaff(["SUPER_ADMIN", "MODERATOR"]);
  await db.update(reports).set({ status }).where(eq(reports.id, id));
  await logAudit({ adminId: user.id, adminName: user.name, action: `REPORT_${status}`, entityType: "report", entityId: id });
  revalidatePath("/admin/moderation");
}
