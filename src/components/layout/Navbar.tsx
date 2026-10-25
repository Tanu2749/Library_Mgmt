"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Search,
  Sparkles,
  User,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut,
  Sliders,
  Bookmark,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "LIBRARIAN" | "MEMBER";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showDemoModal, setShowDemoModal] = React.useState(false);

  const navLinks = [
    { href: "/catalog", label: "Catalog", icon: BookOpen },
    { href: "/chat", label: "AI Librarian", icon: Sparkles, badge: "AI" },
    { href: "/about", label: "About", icon: null },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass border-b border-border/50 transition-colors duration-200">
        {/* Demo notification banner */}
        <div className="bg-primary/10 border-b border-primary/20 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 text-foreground/80">
          <span>✨ Welcome to {siteConfig.name}</span>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={() => setShowDemoModal(true)}
            className="underline font-medium hover:text-primary transition-colors cursor-pointer"
          >
            Click here to view Demo Logins
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-1 hidden sm:block">
                Digital Reading Room
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-foreground/75 hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent text-accent-foreground shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {user && (user.role === "ADMIN" || user.role === "LIBRARIAN") && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                  pathname.startsWith("/admin")
                    ? "text-accent bg-accent/10 shadow-sm font-semibold"
                    : "text-foreground/75 hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Shield className="w-4 h-4 text-accent" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Actions: Search, Theme, Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/catalog"
              aria-label="Search catalog"
              className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors hidden sm:flex items-center justify-center border border-border/40"
              title="Search catalog"
            >
              <Search className="w-4 h-4" />
            </Link>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-sm font-medium border border-border/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate text-foreground">
                    {user.name ?? "Account"}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-95 text-sm font-medium shadow-sm transition-transform active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 text-primary" />}
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground font-semibold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {user && (user.role === "ADMIN" || user.role === "LIBRARIAN") && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user ? (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
              >
                <User className="w-4 h-4 text-primary" />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Your Account</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Demo Accounts Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-bold">Demo Accounts</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Use any of these pre-configured credentials to explore the system with different role permissions:
            </p>

            <div className="space-y-3">
              {siteConfig.demo.accounts.map((acc) => (
                <div
                  key={acc.email}
                  className="p-3 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{acc.email}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary uppercase font-bold">
                        {acc.role}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      Password: {siteConfig.demo.password}
                    </div>
                  </div>
                  <Link
                    href={`/login?email=${encodeURIComponent(acc.email)}`}
                    onClick={() => setShowDemoModal(false)}
                    className="px-3 py-1 text-xs rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
                  >
                    Use
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4 italic text-center">
              Notice: In production, demo accounts should be updated or removed via the admin console.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
