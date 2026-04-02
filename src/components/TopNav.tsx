"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogoutButton } from "@/components/LogoutButton";

export function TopNav({ showLogout }: { showLogout: boolean }) {
  const pathname = usePathname();
  const isAdminArea = pathname === "/admin" || pathname === "/admin/login";
  const isAdmin = showLogout;
  const showTopNavLogout = isAdmin && pathname !== "/admin" && pathname !== "/admin/login";

  const linkBase =
    "rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-slate-100 hover:text-slate-900";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs text-white">
            CR
          </span>
          Civic Reporter
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/" className={clsx(linkBase, pathname === "/" && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white")}>
            Dashboard
          </Link>
          <Link
            href="/submit"
            className={clsx(linkBase, pathname === "/submit" && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white")}
          >
            Submit
          </Link>
          {isAdmin ? (
            <Link
              href="/trends"
              className={clsx(linkBase, pathname === "/trends" && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white")}
            >
              Trends
            </Link>
          ) : null}
          <Link
            href="/admin"
            className={clsx(
              linkBase,
              isAdminArea && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
            )}
          >
            Admin
          </Link>
          {showTopNavLogout ? <LogoutButton /> : null}
        </div>
      </nav>
    </header>
  );
}

