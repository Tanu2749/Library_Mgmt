"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  UploadCloud,
  Settings,
  ArrowLeft,
  Shield,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";

interface AdminSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AdminSidebar({ userRole, userName }: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/books", label: "Book Catalog", icon: BookOpen },
    { href: "/admin/loans", label: "Circulation & Loans", icon: Repeat },
    { href: "/admin/members", label: "Members & Roles", icon: Users },
    { href: "/admin/import", label: "Bulk CSV Import", icon: UploadCloud },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border/60 bg-card/60 backdrop-blur-md flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Header info */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/30 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-foreground">
              {siteConfig.name} Admin
            </div>
            <div className="text-[11px] text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{userRole?.toLowerCase() ?? "staff"} portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-foreground/75 hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public side */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Library</span>
        </Link>
      </div>
    </aside>
  );
}
