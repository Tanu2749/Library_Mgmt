import Link from "next/link";
import {
  BookOpen,
  Users,
  Repeat,
  AlertCircle,
  Plus,
  UploadCloud,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "@/lib/db/queries/admin";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Administration Console
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time library statistics, catalog maintenance, and circulation controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/books"
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:opacity-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </Link>
          <Link
            href="/admin/import"
            className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>CSV Import</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Titles
            </span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold font-serif">{stats.totalBooks}</div>
          <span className="text-[11px] text-muted-foreground">Indexed in DB</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Members
            </span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-serif">{stats.totalMembers}</div>
          <span className="text-[11px] text-muted-foreground">Active readers</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Loans
            </span>
            <Repeat className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-bold font-serif">{stats.activeLoans}</div>
          <span className="text-[11px] text-muted-foreground">Checked out</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Overdue
            </span>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-3xl font-bold font-serif text-destructive">
            {stats.overdueCount}
          </div>
          <span className="text-[11px] text-muted-foreground">Past due date</span>
        </div>
      </div>

      {/* Recharts Visual Data */}
      <DashboardCharts
        weeklyLoans={stats.weeklyLoans}
        genreDistribution={stats.genreDistribution}
      />

      {/* Recent Activity Audit */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-foreground">
            Audit Log & Recent Operations
          </h3>
          <span className="text-xs text-muted-foreground">Live transaction trail</span>
        </div>

        {stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-border/50 text-xs">
            {stats.recentActivity.map((log) => (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-primary/10 text-primary">
                    {log.action}
                  </span>
                  <span className="text-foreground">
                    {log.userName || "System"} performed {log.action.toLowerCase()} on {log.entityType}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No logged events yet. All standard circulation events are recorded automatically.
          </div>
        )}
      </div>
    </div>
  );
}
