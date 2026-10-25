"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface DashboardChartsProps {
  weeklyLoans: { day: string; loans: number; returns: number }[];
  genreDistribution: { name: string; count: number }[];
}

export function DashboardCharts({
  weeklyLoans,
  genreDistribution,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Activity */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif font-bold text-base text-foreground">
            Circulation Activity (Past 7 Days)
          </h3>
          <p className="text-xs text-muted-foreground">
            Daily breakdown of books borrowed vs returned
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyLoans}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar dataKey="loans" name="Loans Issued" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returns" name="Returns Processed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Genres */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif font-bold text-base text-foreground">
            Top Catalog Genres
          </h3>
          <p className="text-xs text-muted-foreground">
            Number of indexed titles per category
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genreDistribution}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" stroke="#888888" fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#888888"
                fontSize={12}
                width={80}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="count"
                name="Titles"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
