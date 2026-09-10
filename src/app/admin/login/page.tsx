import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-2xl font-black text-black">
        F
      </span>
      <h1 className="mt-4 text-xl font-black">FutBetter Admin</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Staff sign in</p>
      <div className="w-full rounded-2xl border border-border bg-surface p-6">
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
