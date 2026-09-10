"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, ShieldCheck } from "lucide-react";
import { isStaffRole } from "@/lib/roles";

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/matches", label: "MATCHES" },
  { href: "/news", label: "NEWS" },
  { href: "/analysis", label: "ANALYSIS" },
  { href: "/results", label: "RESULTS" },
  { href: "/rankings", label: "RANKINGS" },
  { href: "/about", label: "ABOUT" },
];

export function HeaderClient({ siteName }: { siteName?: string }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const isStaff = isStaffRole(session?.user?.role);

  return (
    <>
      <div className="flex items-center gap-3">
        <a
          href="https://stake.com/?c=bo4ixMU7"
          target="_blank"
          rel="noopener sponsored"
          className="hidden items-center gap-1.5 rounded-md bg-[#00e701] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#00c901] sm:inline-flex"
        >
          Stake ↗
        </a>

        {status === "authenticated" && session.user ? (
          <div className="hidden items-center gap-3 sm:flex">
            {isStaff && (
              <Link
                href="/admin"
                className="flex items-center gap-1 rounded-md bg-surface-2 px-3 py-1.5 text-xs font-semibold text-brand"
              >
                <ShieldCheck size={14} /> Admin
              </Link>
            )}
            <Link
              href={`/profile/${session.user.username ?? session.user.id}`}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />
              ) : (
                <User size={18} />
              )}
              {session.user.name}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted hover:text-foreground"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="hidden rounded-md bg-brand px-4 py-1.5 text-sm font-bold text-black transition hover:bg-brand-dark sm:block"
          >
            Login
          </Link>
        )}

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={siteName ? `Toggle ${siteName} menu` : "Toggle menu"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label={siteName ? `${siteName} navigation` : "Site navigation"}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            <a
              href="https://stake.com/?c=bo4ixMU7"
              target="_blank"
              rel="noopener sponsored"
              onClick={() => setOpen(false)}
              className="my-1 rounded-md bg-[#00e701] px-3 py-2.5 text-center text-sm font-black uppercase tracking-wider text-black"
            >
              Bet on Stake ↗
            </a>
            {status === "authenticated" && session.user ? (
              <>
                {isStaff && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-semibold text-brand hover:bg-surface"
                  >
                    Admin panel
                  </Link>
                )}
                <Link
                  href={`/profile/${session.user.username ?? session.user.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-surface"
                >
                  My profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-semibold text-red-400 hover:bg-surface"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md bg-brand px-3 py-2.5 text-center text-sm font-bold text-black"
              >
                Login with Telegram
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
