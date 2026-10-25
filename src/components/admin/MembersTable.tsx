"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "LIBRARIAN" | "MEMBER";
  isActive: boolean;
  createdAt: string | Date;
}

export function MembersTable({
  initialMembers,
}: {
  initialMembers: MemberRow[];
}) {
  const router = useRouter();
  const [members, setMembers] = React.useState<MemberRow[]>(initialMembers);
  const [search, setSearch] = React.useState("");

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/members/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        toast.error("Failed to update member role");
      } else {
        toast.success(`Role updated to ${newRole}`);
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role: newRole as any } : m))
        );
        router.refresh();
      }
    } catch {
      toast.error("Error updating role");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/members/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update member status");
      } else {
        toast.success(`Member ${!currentStatus ? "activated" : "suspended"}`);
        setMembers((prev) =>
          prev.map((m) =>
            m.id === userId ? { ...m, isActive: !currentStatus } : m
          )
        );
        router.refresh();
      }
    } catch {
      toast.error("Error toggling member status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members by name or email..."
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {m.name}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-mono">
                    {m.email}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-border bg-background text-xs font-semibold"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="LIBRARIAN">LIBRARIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.isActive
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {m.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(m.id, m.isActive)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                        m.isActive
                          ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                          : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                      }`}
                    >
                      {m.isActive ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
