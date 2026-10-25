"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";

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

  return (
    <Link
      href={`/book/${id}`}
      className="book-card group block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <div className="book-card-inner rounded-2xl bg-card border border-border/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
        {/* Cover with aspect ratio */}
        <div className="relative aspect-[2/3] w-full bg-muted/60 overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Cover of ${title}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-card to-muted">
              <BookOpen className="w-12 h-12 text-primary/40 mb-2" />
              <span className="font-serif text-sm font-semibold text-foreground/80 line-clamp-3">
                {title}
              </span>
            </div>
          )}

          {/* Availability pill floating top right */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs ${
                isAvailable
                  ? "bg-emerald-500/90 text-white"
                  : "bg-amber-600/90 text-white"
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

          {/* Genre tag bottom left */}
          {genres.length > 0 && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                {genres[0].name}
              </span>
            </div>
          )}
        </div>

        {/* Book details */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {authorNames}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>{publishedYear ?? "Classic"}</span>
            <span className="text-primary font-medium group-hover:underline">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
