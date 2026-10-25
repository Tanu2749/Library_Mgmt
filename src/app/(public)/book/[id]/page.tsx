import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Globe,
  FileText,
  Tag,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { getBookById, getSimilarBooks } from "@/lib/db/queries/books";
import { getCurrentUser } from "@/lib/auth/guards";
import { BookCard } from "@/components/books/BookCard";
import { BorrowButton } from "@/components/books/BorrowButton";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  const user = await getCurrentUser();
  const similarBooks = await getSimilarBooks(book.id, 4);

  const authorNames = book.authors.map((a) => a.name).join(", ") || "Unknown Author";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Catalog */}
      <div className="mb-6">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Book Detail Card */}
      <div className="rounded-3xl bg-card border border-border/80 p-6 md:p-10 shadow-sm mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Cover with 3D Tilt perspective */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="book-card w-full max-w-[280px]">
              <div className="book-card-inner rounded-2xl overflow-hidden shadow-2xl border border-border/60 aspect-[2/3] bg-muted/60 relative">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <BookOpen className="w-16 h-16 text-primary/40 mb-3" />
                    <span className="font-serif text-lg font-bold">{book.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Availability status badge */}
            <div className="mt-6 w-full max-w-[280px] p-3.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  book.availableCopies > 0
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {book.availableCopies > 0
                  ? `${book.availableCopies} of ${book.totalCopies} Available`
                  : "All Copies Checked Out"}
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Genres */}
              {book.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/catalog?genre=${g.slug}`}
                      className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title & Subtitle */}
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-lg text-muted-foreground mt-1">
                    {book.subtitle}
                  </p>
                )}
              </div>

              {/* Authors */}
              <div className="text-sm">
                <span className="text-muted-foreground">By </span>
                <span className="font-semibold text-foreground">
                  {authorNames}
                </span>
              </div>

              {/* Description */}
              <div className="pt-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Synopsis
                </h2>
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                  {book.description ||
                    "No synopsis available for this title at the moment."}
                </p>
              </div>

              {/* AI Insight (if available) */}
              {book.aiDescription && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Librarian Note & Themes</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed italic">
                    {book.aiDescription}
                  </p>
                </div>
              )}

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {book.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-muted text-muted-foreground"
                      >
                        <Tag className="w-3 h-3 opacity-60" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-border/60">
              <BorrowButton
                bookId={book.id}
                bookTitle={book.title}
                availableCopies={book.availableCopies}
                user={user}
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/40 text-xs">
              <div>
                <span className="text-muted-foreground block">ISBN</span>
                <span className="font-mono font-medium text-foreground">
                  {book.isbn || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Published</span>
                <span className="font-medium text-foreground">
                  {book.publishedYear || "Unknown"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Language</span>
                <span className="font-medium text-foreground">
                  {book.language}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Pages</span>
                <span className="font-medium text-foreground">
                  {book.pageCount ? `${book.pageCount} pp.` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Books Section */}
      {similarBooks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">
              Readers Also Explored
            </h2>
            <Link
              href="/catalog"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Browse entire collection →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {similarBooks.map((sim) => (
              <BookCard
                key={sim.id}
                id={sim.id}
                title={sim.title}
                coverUrl={sim.coverUrl}
                availableCopies={sim.availableCopies}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
