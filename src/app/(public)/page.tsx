import Link from "next/link";
import {
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Compass,
  Clock,
  Bookmark,
  Users,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { getFeaturedBooks } from "@/lib/db/queries/books";
import { BookCard } from "@/components/books/BookCard";
import { DynamicHero } from "@/components/three/DynamicHero";

export default async function HomePage() {
  const featuredBooks = await getFeaturedBooks(8);

  return (
    <div className="space-y-16 pb-12">
      {/* ─── Hero Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Text & Search */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Next-Generation Digital Reading Room</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Where timeless knowledge meets{" "}
              <span className="text-primary italic">intelligence</span>.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              Welcome to {siteConfig.name}. Browse 40 curated works of literature, history, and science, or converse with Athena, your AI research librarian grounded exclusively in real books.
            </p>

            {/* Quick Hero Search Input */}
            <form action="/catalog" method="GET" className="relative max-w-lg">
              <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
              <input
                type="text"
                name="query"
                placeholder="Search by title, author, or try 'books like Dune'..."
                className="w-full pl-11 pr-28 py-3 rounded-2xl border border-border bg-card text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:opacity-95 transition-opacity"
              >
                Search
              </button>
            </form>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/catalog"
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:opacity-95 flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Catalog</span>
              </Link>

              <Link
                href="/chat"
                className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Consult Athena AI</span>
              </Link>
            </div>
          </div>

          {/* Right Hero 3D Bookshelf Scene */}
          <div className="lg:col-span-6 h-[380px] sm:h-[420px] w-full">
            <DynamicHero />
          </div>
        </div>
      </section>

      {/* ─── Highlights / Stats Bar ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-card border border-border shadow-xs">
          <div className="text-center p-3">
            <div className="font-serif text-3xl font-bold text-foreground">40+</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Curated Masterpieces
            </div>
          </div>

          <div className="text-center p-3">
            <div className="font-serif text-3xl font-bold text-primary">14 Days</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Standard Loan Period
            </div>
          </div>

          <div className="text-center p-3">
            <div className="font-serif text-3xl font-bold text-accent">100%</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Grounded AI (No Fake Titles)
            </div>
          </div>

          <div className="text-center p-3">
            <div className="font-serif text-3xl font-bold text-foreground">Zero</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Extra Servers Needed
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Collection ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Permanent Collection
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Featured Titles & New Arrivals
            </h2>
          </div>

          <Link
            href="/catalog"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all 40 titles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              subtitle={book.subtitle}
              coverUrl={book.coverUrl}
              authors={book.authors}
              availableCopies={book.availableCopies}
              totalCopies={book.totalCopies}
              publishedYear={book.publishedYear}
            />
          ))}
        </div>
      </section>

      {/* ─── AI Librarian Banner ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-card via-muted/50 to-card border border-border p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Athena Assistant</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Looking for something specific? Ask your personal AI librarian.
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              &quot;Find me a sci-fi book about habits&quot;, &quot;A short space adventure for a teenager&quot;, or &quot;Something profound on the meaning of life&quot; — Athena reasons over every work in the library with precision.
            </p>

            <div className="pt-2">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>Start Conversation with Athena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
