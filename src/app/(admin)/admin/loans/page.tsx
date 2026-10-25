import { getAllLoansAdmin } from "@/lib/db/queries/admin";
import { LoansTable } from "@/components/admin/LoansTable";

export default async function AdminLoansPage() {
  const loans = await getAllLoansAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Circulation Desk
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Process returns, review overdue items, and monitor active borrowings.
        </p>
      </div>

      <LoansTable initialLoans={loans} />
    </div>
  );
}
