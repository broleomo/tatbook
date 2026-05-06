"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Zap,
  Settings,
  BookOpen,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps {
  artistId: string;
  displayName: string;
}

const navItems = [
  { href: "/artist/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/artist/dashboard/bookings", label: "Bookings", icon: BookOpen },
  { href: "/artist/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/artist/dashboard/flash", label: "Flash Designs", icon: Zap },
  { href: "/artist/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar({ artistId, displayName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-obsidian-800 bg-obsidian-950 min-h-screen">
      <div className="p-6 border-b border-obsidian-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-white">TatBook</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-ink-900/50 text-ink-300 ring-1 ring-ink-700/30"
                  : "text-obsidian-400 hover:text-white hover:bg-obsidian-800"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-obsidian-800 space-y-1">
        <Link
          href={`/artist/${artistId}`}
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          View public profile
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-obsidian-400 hover:text-red-400 hover:bg-obsidian-800 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
