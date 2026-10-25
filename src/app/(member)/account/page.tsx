import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/guards";
import { getUserLoans, getUserFines, getUserReservations, getLoanRules } from "@/lib/db/queries/loans";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Receipt,
  RotateCw,
} from "lucide-react";
import { RenewButton } from "@/components/books/RenewButton";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [allLoans, finesList, reservationsList, rules] = await Promise.all([
    getUserLoans(user.id),
    getUserFines(user.id),
    getUserReservations(user.id),
    getLoanRules(),
  ]);

  const activeLoans = allLoans.filter((l) => l.status === "ACTIVE");
  const pastLoans = allLoans.filter((l) => l.status === "RETURNED");

  const unpaidFines = finesList.filter((f) => f.status === "UNPAID");
  const totalUnpaidFine = unpaidFines.reduce(
    (sum, f) => sum + parseFloat(f.amount),
    0
  );

  return (
    <div className="space-y-8">
      {/* Stats summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">
              {activeLoans.length}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                / {rules.maxBooksPerMember} max
              </span>
            </span>
            <p className="text-xs text-muted-foreground">Active Borrowed Books</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">
              {reservationsList.length}
            </span>
            <p className="text-xs text-muted-foreground">Active Reservations</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-2xs">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              totalUnpaidFine > 0
                ? "bg-destructive/15 text-destructive"
                : "bg-emerald-500/15 text-emerald-500"
            }`}
          >
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(totalUnpaidFine)}
            </span>
            <p className="text-xs text-muted-foreground">
              {totalUnpaidFine > 0 ? "Outstanding Fines Due" : "Fines Balance (Clear)"}
            </p>
          </div>
        </div>
      </div>

      {/* Unpaid fines alert */}
      {totalUnpaidFine > 0 && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Outstanding Fine Notice</h4>
            <p className="text-xs mt-0.5 opacity-90">
              You have {formatCurrency(totalUnpaidFine)} in outstanding library fines. New borrowing requests are restricted until your balance is cleared at the front desk.
            </p>
          </div>
        </div>
      )}

      {/* Current Loans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Currently Borrowed</span>
          </h2>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-primary hover:underline"
          >
            + Borrow more books
          </Link>
        </div>

        {activeLoans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => {
              const isOverdue = new Date(loan.dueDate) < new Date();
              return (
                <div
                  key={loan.id}
                  className={`p-4 rounded-2xl bg-card border transition-shadow hover:shadow-md flex gap-4 ${
                    isOverdue
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-border/80"
                  }`}
                >
                  <div className="w-16 h-24 bg-muted rounded-lg overflow-hidden shrink-0 border border-border/60">
                    {loan.bookCover ? (
                      <img
                        src={loan.bookCover}
                        alt={loan.bookTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/book/${loan.bookId}`}
                        className="font-serif font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {loan.bookTitle}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <div>Borrowed: {formatDate(loan.borrowedAt)}</div>
                        <div
                          className={`font-semibold ${
                            isOverdue ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          Due: {formatDate(loan.dueDate)}{" "}
                          {isOverdue && "(OVERDUE)"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <RenewButton
                        loanId={loan.id}
                        renewalCount={loan.renewalCount}
                        maxRenewals={rules.maxRenewals}
                        dueDate={loan.dueDate}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-card border border-border space-y-2">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">No active loans</p>
            <p className="text-xs text-muted-foreground">
              You haven&apos;t checked out any books yet.
            </p>
            <Link
              href="/catalog"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>

      {/* Reservations Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-accent" />
          <span>My Reservations</span>
        </h2>

        {reservationsList.length > 0 ? (
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="divide-y divide-border/60">
              {reservationsList.map((res) => (
                <div
                  key={res.id}
                  className="p-4 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-accent" />
                    <div>
                      <Link
                        href={`/book/${res.bookId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {res.bookTitle}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        Reserved on {formatDate(res.reservedAt)}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      res.status === "READY"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : res.status === "PENDING"
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-card border border-border text-xs text-muted-foreground">
            No active reservations placed.
          </div>
        )}
      </div>

      {/* Reading History */}
      {pastLoans.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            <span>Reading History</span>
          </h2>

          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="divide-y divide-border/60 text-sm">
              {pastLoans.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <Link
                      href={`/book/${l.bookId}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {l.bookTitle}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      Returned on {l.returnedAt ? formatDate(l.returnedAt) : "N/A"}
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Returned
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
