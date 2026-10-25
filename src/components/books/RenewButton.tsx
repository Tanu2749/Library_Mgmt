"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RenewButtonProps {
  loanId: string;
  renewalCount: number;
  maxRenewals?: number;
  dueDate: string | Date;
}

export function RenewButton({
  loanId,
  renewalCount,
  maxRenewals = 2,
  dueDate,
}: RenewButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const isMaxed = renewalCount >= maxRenewals;
  const isOverdue = new Date(dueDate) < new Date();

  const handleRenew = async () => {
    if (isMaxed) {
      toast.error(`Maximum renewal limit (${maxRenewals}) reached`);
      return;
    }
    if (isOverdue) {
      toast.error("Overdue loans cannot be renewed. Please return the book.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/loans/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to renew loan");
      } else {
        toast.success(data.message || "Loan renewed!");
        router.refresh();
      }
    } catch {
      toast.error("Failed to renew loan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRenew}
      disabled={loading || isMaxed || isOverdue}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
        isMaxed || isOverdue
          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
          : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
      }`}
      title={
        isOverdue
          ? "Cannot renew overdue loan"
          : isMaxed
          ? "Max renewals reached"
          : "Renew for 14 more days"
      }
    >
      <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
      <span>{isMaxed ? "Maxed" : `Renew (${renewalCount}/${maxRenewals})`}</span>
    </button>
  );
}
