import Link from "next/link";
import { BookOpen, Heart, Sparkles, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 text-foreground transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Catalog & System Online</span>
            </div>
          </div>

          {/* Catalog discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Discovery
            </h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>
                <Link
                  href="/catalog"
                  className="hover:text-primary transition-colors"
                >
                  Browse Full Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?genre=fiction"
                  className="hover:text-primary transition-colors"
                >
                  Fiction & Classics
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?genre=sci-fi"
                  className="hover:text-primary transition-colors"
                >
                  Science & Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?availability=available"
                  className="hover:text-primary transition-colors"
                >
                  Available Now to Borrow
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Smart Features
            </h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>
                <Link
                  href="/chat"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>AI Librarian Assistant</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?semantic=true"
                  className="hover:text-primary transition-colors"
                >
                  Semantic Catalog Search
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="hover:text-primary transition-colors"
                >
                  My Loans & Due Dates
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  Borrowing Rules & Fines
                </Link>
              </li>
            </ul>
          </div>

          {/* Loan rules & hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Circulation Rules
            </h4>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div>
                <strong className="text-foreground">Standard Loan:</strong>{" "}
                {siteConfig.rules.loanPeriodDays} days
              </div>
              <div>
                <strong className="text-foreground">Max Books:</strong>{" "}
                {siteConfig.rules.maxBooksPerMember} items per member
              </div>
              <div>
                <strong className="text-foreground">Renewals:</strong> up to{" "}
                {siteConfig.rules.maxRenewals} times
              </div>
              <div>
                <strong className="text-foreground">Overdue Fee:</strong> $
                {siteConfig.rules.finePerDay.toFixed(2)} / day after{" "}
                {siteConfig.rules.gracePeriodDays} day grace
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/api/health" className="hover:text-primary transition-colors font-mono">
              /api/health
            </Link>
            <span className="text-border">•</span>
            <span>Zero-serverless deployment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
