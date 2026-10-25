"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Bookmark, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BorrowButtonProps {
  bookId: string;
  bookTitle: string;
  availableCopies: number;
  user?: {
    id: string;
    role?: string;
  } | null;
}

export function BorrowButton({
  bookId,
  bookTitle,
  availableCopies,
  user,
}: BorrowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const isAvailable = availableCopies > 0;

  const handleAction = async () => {
    if (!user) {
      toast.info("Please sign in to borrow or reserve books");
      router.push(`/login?callbackUrl=/book/${bookId}`);
      return;
    }

    setLoading(true);
    try {
      if (isAvailable) {
        // Borrow book
        const res = await fetch("/api/loans/borrow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error?.message || "Failed to borrow book");
        } else {
          toast.success(`"${bookTitle}" borrowed successfully! Due in 14 days.`);
          router.refresh();
        }
      } else {
        // Reserve book
        toast.success(`Reservation placed for "${bookTitle}". We will notify you when a copy returns.`);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <button
        onClick={handleAction}
        disabled={loading}
        className={`px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 ${
          isAvailable
            ? "bg-primary text-primary-foreground hover:opacity-95"
            : "bg-accent text-accent-foreground hover:opacity-95"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isAvailable ? (
          <BookOpen className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        <span>
          {loading
            ? "Processing..."
            : isAvailable
            ? "Borrow This Book"
            : "Place Hold / Reserve"}
        </span>
      </button>

      <span className="text-xs text-muted-foreground text-center sm:text-left">
        {isAvailable
          ? `${availableCopies} copies currently in library`
          : "All copies currently on loan"}
      </span>
    </div>
  );
}
