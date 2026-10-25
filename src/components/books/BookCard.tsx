"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export interface BookCardProps {
  id: string;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  authors?: { name: string }[];
  genres?: { name: string; slug: string }[];
  availableCopies: number;
  totalCopies?: number;
  publishedYear?: number | null;
}

const GENRE_COLORS: Record<string, string> = {
  "sci-fi": "from-blue-900/90 to-indigo-900/90",
  fiction: "from-purple-900/90 to-violet-900/90",
  classic: "from-amber-900/90 to-yellow-900/90",
  mystery: "from-slate-900/90 to-zinc-900/90",
  fantasy: "from-emerald-900/90 to-teal-900/90",
  "non-fiction": "from-orange-900/90 to-red-900/90",
  biography: "from-rose-900/90 to-pink-900/90",
  romance: "from-pink-900/90 to-rose-900/90",
  history: "from-stone-900/90 to-neutral-900/90",
  philosophy: "from-cyan-900/90 to-sky-900/90",
  "self-help": "from-lime-900/90 to-green-900/90",
  science: "from-blue-900/90 to-cyan-900/90",
};

export function BookCard({
  id,
  title,
  subtitle,
  coverUrl,
  authors = [],
  genres = [],
  availableCopies,
  totalCopies,
  publishedYear,
}: BookCardProps) {
  const isAvailable = availableCopies > 0;
  const authorNames = authors.map((a) => a.name).join(", ") || "Unknown Author";
  const primaryGenre = genres[0];
  const gradClass =
    primaryGenre?.slug && GENRE_COLORS[primaryGenre.slug]
      ? GENRE_COLORS[primaryGenre.slug]
      : "from-gray-900/90 to-slate-900/90";

  return (
    <Link
      href={`/book/${id}`}
      className="book-card group block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <div className="book-card-inner rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
        {/* ── Cover ── */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/30">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Cover of ${title}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}

          {/* Fallback gradient cover (hidden unless img errors) */}
          <div
            style={{ display: coverUrl ? "none" : "flex" }}
            className={`absolute inset-0 bg-gradient-to-br ${gradClass} flex flex-col items-center justify-center p-5 text-center`}
          >
            <BookOpen className="w-10 h-10 text-white/40 mb-3" />
            <span className="font-serif text-sm font-bold text-white/90 line-clamp-3 leading-snug">
              {title}
            </span>
            <span className="text-xs text-white/50 mt-1">{authorNames}</span>
          </div>

          {/* ── Gradient scrim on hover for "View Details" overlay ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold">
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* ── Availability badge ── */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm shadow ${
                isAvailable
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{availableCopies} left</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  <span>On Loan</span>
                </>
              )}
            </span>
          </div>

          {/* ── Genre tag ── */}
          {primaryGenre && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-black/60 text-white backdrop-blur-sm">
                {primaryGenre.name}
              </span>
            </div>
          )}
        </div>

        {/* ── Meta ── */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 italic">
                {subtitle}
              </p>
            )}
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {authorNames}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground">
              {publishedYear ?? "Classic"}
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                isAvailable
                  ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isAvailable ? "Borrow →" : "On Hold"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
