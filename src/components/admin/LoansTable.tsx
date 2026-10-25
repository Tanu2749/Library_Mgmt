"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCw, AlertCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface LoanRow {
  id: string;
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
  borrowedAt: string | Date;
  dueDate: string | Date;
  returnedAt?: string | Date | null;
  renewalCount: number;
  bookTitle: string;
  userName: string | null;
  userEmail: string | null;
}

export function LoansTable({ initialLoans }: { initialLoans: LoanRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<"ALL" | "ACTIVE" | "OVERDUE" | "RETURNED">("ALL");
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const filtered = initialLoans.filter((l) => {
    const isOverdue = l.status === "ACTIVE" && new Date(l.dueDate) < new Date();
    if (filter === "ACTIVE") return l.status === "ACTIVE" && !isOverdue;
    if (filter === "OVERDUE") return isOverdue;
    if (filter === "RETURNED") return l.status === "RETURNED";
    return true;
  });

  const handleReturn = async (loanId: string) => {
    setProcessingId(loanId);
    try {
      const res = await fetch("/api/loans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to process return");
      } else {
        toast.success(data.message || "Book returned successfully");
        router.refresh();
      }
    } catch {
      toast.error("Error processing return");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 text-xs">
        {(["ALL", "ACTIVE", "OVERDUE", "RETURNED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === tab
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Borrowed</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((l) => {
                const isOverdue =
                  l.status === "ACTIVE" && new Date(l.dueDate) < new Date();

                return (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">
                        {l.userName || "Unknown"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {l.userEmail}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-serif font-medium text-foreground">
                      {l.bookTitle}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(l.borrowedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          isOverdue
                            ? "font-bold text-destructive"
                            : "text-foreground"
                        }
                      >
                        {formatDate(l.dueDate)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isOverdue
                            ? "bg-destructive/15 text-destructive"
                            : l.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isOverdue ? "OVERDUE" : l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {l.status === "ACTIVE" && (
                        <button
                          onClick={() => handleReturn(l.id)}
                          disabled={processingId === l.id}
                          className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-[11px] hover:opacity-90 transition-opacity"
                        >
                          {processingId === l.id ? "Processing..." : "Process Return"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
