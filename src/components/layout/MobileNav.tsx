"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Sparkles, User, Shield } from "lucide-react";

interface MobileNavProps {
  user?: {
    id: string;
    role?: "ADMIN" | "LIBRARIAN" | "MEMBER";
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/catalog", label: "Catalog", icon: BookOpen },
    { href: "/chat", label: "Athena AI", icon: Sparkles },
    ...(user && (user.role === "ADMIN" || user.role === "LIBRARIAN")
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : [{ href: user ? "/account" : "/login", label: user ? "Account" : "Sign In", icon: User }]),
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/70 shadow-lg safe-bottom"
    >
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[11px] truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
