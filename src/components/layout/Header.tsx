"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import BatSkull from "@/components/ui/BatSkull";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    id?: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isArtist = user?.role === "ARTIST";

  return (
    <header className="sticky top-0 z-50 border-b border-obsidian-800 bg-obsidian-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="transition-transform group-hover:scale-110 inline-flex">
              <BatSkull size={36} />
            </span>
            <span className="text-xl font-display text-white">TatBook</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/artists" current={pathname === "/artists"}>
              Find Artists
            </NavLink>
            {isArtist && (
              <NavLink href="/artist/dashboard" current={pathname.startsWith("/artist/dashboard")}>
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={isArtist ? "/artist/dashboard" : "/profile"}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-obsidian-300 hover:text-white hover:bg-obsidian-800 transition-all"
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="h-6 w-6 rounded-full" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-ink-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span>{user.name ?? user.email}</span>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <button type="submit" className="btn-ghost text-xs py-2 px-3">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost py-2 px-4 text-sm">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden rounded-lg p-2 text-obsidian-400 hover:text-white hover:bg-obsidian-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-obsidian-800 bg-obsidian-950 px-4 py-4 space-y-2">
          <MobileNavLink href="/artists" onClick={() => setMobileOpen(false)}>
            Find Artists
          </MobileNavLink>
          {isArtist && (
            <MobileNavLink href="/artist/dashboard" onClick={() => setMobileOpen(false)}>
              Dashboard
            </MobileNavLink>
          )}
          <div className="pt-3 border-t border-obsidian-800 space-y-2">
            {user ? (
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="w-full btn-secondary text-sm">
                  Sign out
                </button>
              </form>
            ) : (
              <>
                <Link href="/login" className="block btn-secondary text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link href="/register" className="block btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-all",
        current
          ? "bg-obsidian-800 text-white"
          : "text-obsidian-400 hover:text-white hover:bg-obsidian-800"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-obsidian-300 hover:text-white hover:bg-obsidian-800 transition-all"
    >
      {children}
    </Link>
  );
}
