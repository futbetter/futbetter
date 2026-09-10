"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Shield,
  Trophy,
  Megaphone,
  Handshake,
  FileText,
  Users,
  ShieldAlert,
  Settings,
  ScrollText,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/matches", label: "Matches", icon: CalendarDays },
  { href: "/admin/teams", label: "Teams", icon: Shield },
  { href: "/admin/competitions", label: "Competitions", icon: Trophy },
  { href: "/admin/ads", label: "Advertising", icon: Megaphone },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const MOBILE_TABS = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/matches", label: "Matches", icon: CalendarDays },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function AdminShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName?: string | null;
  role: Role;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} onNavigate={() => {}} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <Link href="/admin" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-brand text-sm font-black text-black">
                F
              </span>
              <span className="font-black">Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1 text-xs text-muted hover:text-brand sm:flex"
            >
              View site <ExternalLink size={12} />
            </Link>
            <div className="text-right">
              <p className="text-xs font-semibold leading-tight">{userName ?? "Staff"}</p>
              <p className="text-[10px] leading-tight text-brand">{ROLE_LABELS[role]}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md p-2 text-muted hover:bg-surface hover:text-foreground"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface">
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <span className="font-black">Menu</span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-surface lg:hidden">
          {MOBILE_TABS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <>
      <div className="hidden h-14 items-center gap-2 border-b border-border px-4 lg:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-brand text-sm font-black text-black">
          F
        </span>
        <span className="font-black">
          Fut<span className="text-brand">Better</span> Admin
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-brand/10 text-brand" : "text-foreground/80 hover:bg-surface-2"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
