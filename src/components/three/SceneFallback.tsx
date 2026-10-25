"use client";

import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";

interface FallbackBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  color: string;
}

export function SceneFallback() {
  const sampleBooks: FallbackBook[] = [
    {
      id: "dune",
      title: "Dune",
      author: "Frank Herbert",
      genre: "Sci-Fi",
      color: "from-amber-700 to-amber-950",
    },
    {
      id: "1984",
      title: "1984",
      author: "George Orwell",
      genre: "Dystopia",
      color: "from-slate-700 to-slate-900",
    },
    {
      id: "sapiens",
      title: "Sapiens",
      author: "Yuval Noah Harari",
      genre: "History",
      color: "from-orange-800 to-amber-900",
    },
    {
      id: "atomic-habits",
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Psychology",
      color: "from-rose-800 to-red-950",
    },
  ];

  return (
    <div className="w-full h-full min-h-[380px] rounded-3xl bg-gradient-to-br from-card via-muted/40 to-card border border-border/80 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex items-center justify-between z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Bookshelf</span>
        </span>
        <span className="text-[11px] text-muted-foreground">
          Interactive Reading Room
        </span>
      </div>

      {/* Floating Stylized Bookshelf (CSS 3D perspective) */}
      <div className="my-auto py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 z-10 perspective-1000">
        {sampleBooks.map((book, idx) => (
          <Link
            key={book.id}
            href={`/catalog?query=${encodeURIComponent(book.title)}`}
            className="group block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            style={{
              transform: `translateY(${idx % 2 === 0 ? "-6px" : "6px"})`,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            <div
              className={`aspect-[2/3] rounded-xl bg-gradient-to-br ${book.color} p-4 text-white shadow-xl flex flex-col justify-between border border-white/10 group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-300`}
            >
              <div className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 block mb-0.5">
                  {book.genre}
                </span>
                <h4 className="font-serif font-bold text-sm leading-tight text-white line-clamp-2">
                  {book.title}
                </h4>
                <p className="text-[10px] text-white/80 mt-1 line-clamp-1">
                  {book.author}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom shelf plinth */}
      <div className="w-full h-3 rounded-full bg-gradient-to-r from-border via-primary/30 to-border shadow-xs mt-2" />
    </div>
  );
}
