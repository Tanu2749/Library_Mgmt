import Link from "next/link";
import { BookOpen, ShieldCheck, Clock, Receipt, Sparkles, Box } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto border border-primary/30">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          About {siteConfig.name}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          {siteConfig.tagline}. A modern digital sanctuary created to preserve literary heritage and empower intellectual curiosity through AI.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Clock className="w-5 h-5" />
            <span>Borrowing Durations</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All registered members may check out titles for a standard period of{" "}
            <strong>{siteConfig.rules.loanPeriodDays} days</strong>. Books may be renewed up to{" "}
            <strong>{siteConfig.rules.maxRenewals} times</strong> as long as no other patron has placed a hold.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 text-accent font-bold">
            <Receipt className="w-5 h-5" />
            <span>Fines & Grace Period</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We grant a <strong>{siteConfig.rules.gracePeriodDays}-day grace period</strong> upon the due date. Subsequently, an overdue fee of{" "}
            <strong>${siteConfig.rules.finePerDay.toFixed(2)}/day</strong> is assessed until return. Unpaid balances pause new borrowings.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-bold">
            <Sparkles className="w-5 h-5" />
            <span>Athena, AI Librarian</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Athena is grounded exclusively in real books indexed in our database. She will never hallucinate imaginary titles and provides genuine literary cross-references.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 text-indigo-500 font-bold">
            <Box className="w-5 h-5" />
            <span>3D Interactive Bookshelf</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Crafted with Three.js and React Three Fiber. Automatically falls back to a clean CSS layout on devices with low GPU power or reduced-motion preferences.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-muted/40 border border-border text-center space-y-3">
        <h3 className="font-serif font-bold text-base">Ready to start reading?</h3>
        <p className="text-xs text-muted-foreground">
          Explore our complete catalog or log in with one of our demo accounts.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/catalog"
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
          >
            Browse Catalog
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted"
          >
            Sign In / Demo Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}
