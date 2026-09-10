import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function logAudit(params: {
  adminId?: string | null;
  adminName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      adminId: params.adminId ?? null,
      adminName: params.adminName ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      details: params.details ?? {},
    });
  } catch (e) {
    console.error("[audit] failed to write log:", e);
  }
}
