import Link from "next/link";
import { Search, Sparkles, Filter, X, SlidersHorizontal, BookOpen } from "lucide-react";
import { getBooks, getAllGenres } from "@/lib/db/queries/books";
import { BookCard } from "@/components/books/BookCard";

interface CatalogPageProps {
  searchParams: Promise<{
    query?: string;
    genre?: string;
    language?: string;
    availability?: "all" | "available" | "unavailable";
    sortBy?: "title" | "publishedYear" | "createdAt";
    sortOrder?: "asc" | "desc";
    page?: string;
    semantic?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 12;

  const { books: bookList, total, totalPages } = await getBooks({
    query: params.query,
    genre: params.genre,
    language: params.language,
    availability: params.availability,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    page,
    pageSize,
  });

  const allGenres = await getAllGenres();

  const isSemantic = params.semantic === "true";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Library Collection</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Browse Catalog
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Search over 40 curated works across fiction, history, science, philosophy, and technology.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        {/* Main Search Bar */}
        <form method="GET" action="/catalog" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              name="query"
              defaultValue={params.query || ""}
              placeholder={
                isSemantic
                  ? "Try: 'books like Atomic Habits but fiction' or 'mind bending space adventure'..."
                  : "Search by book title, author, description, or ISBN..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            {isSemantic && <input type="hidden" name="semantic" value="true" />}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-xs hover:opacity-95 transition-opacity"
            >
              Search
            </button>
            <Link
              href={`/catalog?semantic=${isSemantic ? "false" : "true"}`}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isSemantic
                  ? "bg-accent text-accent-foreground border-accent shadow-xs"
                  : "bg-muted/60 text-foreground/80 border-border hover:bg-muted"
              }`}
              title="Toggle AI semantic natural language search"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Semantic AI Search</span>
            </Link>
          </div>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Genre:</span>
          </span>

          <Link
            href="/catalog"
            className={`px-3 py-1 rounded-full border transition-colors ${
              !params.genre
                ? "bg-primary text-primary-foreground border-primary font-semibold"
                : "bg-muted/40 border-border text-foreground hover:bg-muted"
            }`}
          >
            All
          </Link>

          {allGenres.slice(0, 8).map((g) => (
            <Link
              key={g.id}
              href={`/catalog?genre=${g.slug}${params.query ? `&query=${encodeURIComponent(params.query)}` : ""}`}
              className={`px-3 py-1 rounded-full border transition-colors ${
                params.genre === g.slug
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-muted/40 border-border text-foreground hover:bg-muted"
              }`}
            >
              {g.name}
            </Link>
          ))}

          {/* Availability Filter */}
          <div className="ml-auto flex items-center gap-1.5 pl-2">
            <span className="text-muted-foreground">Availability:</span>
            <Link
              href={`/catalog?availability=available${params.genre ? `&genre=${params.genre}` : ""}`}
              className={`px-2.5 py-1 rounded-md text-xs border ${
                params.availability === "available"
                  ? "bg-emerald-500 text-white border-emerald-600 font-medium"
                  : "bg-muted/30 border-border text-foreground hover:bg-muted"
              }`}
            >
              In Library
            </Link>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {bookList.length} of {total} titles
          {params.query && ` for "${params.query}"`}
        </span>
        {(params.query || params.genre || params.availability) && (
          <Link
            href="/catalog"
            className="text-primary hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear filters</span>
          </Link>
        )}
      </div>

      {/* Books Grid */}
      {bookList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {bookList.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              subtitle={book.subtitle}
              coverUrl={book.coverUrl}
              authors={book.authors}
              genres={book.genres}
              availableCopies={book.availableCopies}
              totalCopies={book.totalCopies}
              publishedYear={book.publishedYear}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-card border border-border p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="font-serif text-xl font-bold">No books found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn&apos;t find any books matching your search criteria. Try a different keyword, clear your filters, or ask Athena our AI Librarian.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/catalog"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              View All Books
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Librarian</span>
            </Link>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Link
            href={`/catalog?page=${Math.max(1, page - 1)}${
              params.query ? `&query=${encodeURIComponent(params.query)}` : ""
            }${params.genre ? `&genre=${params.genre}` : ""}`}
            className={`px-4 py-2 rounded-xl border border-border text-xs font-semibold ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "hover:bg-muted transition-colors"
            }`}
          >
            ← Previous
          </Link>
          <span className="text-xs text-muted-foreground px-4">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/catalog?page=${Math.min(totalPages, page + 1)}${
              params.query ? `&query=${encodeURIComponent(params.query)}` : ""
            }${params.genre ? `&genre=${params.genre}` : ""}`}
            className={`px-4 py-2 rounded-xl border border-border text-xs font-semibold ${
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "hover:bg-muted transition-colors"
            }`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
