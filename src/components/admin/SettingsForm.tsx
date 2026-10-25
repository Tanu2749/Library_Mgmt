"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Sliders, Shield, Sparkles, Palette } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site.config";

interface SettingsFormProps {
  initialSettings: Record<string, any>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const [libraryName, setLibraryName] = React.useState(
    initialSettings.library_name || siteConfig.name
  );
  const [tagline, setTagline] = React.useState(
    initialSettings.tagline || siteConfig.tagline
  );
  const [loanPeriodDays, setLoanPeriodDays] = React.useState(
    (initialSettings.loan_period_days || siteConfig.rules.loanPeriodDays).toString()
  );
  const [maxBooksPerMember, setMaxBooksPerMember] = React.useState(
    (initialSettings.max_books_per_member || siteConfig.rules.maxBooksPerMember).toString()
  );
  const [maxRenewals, setMaxRenewals] = React.useState(
    (initialSettings.max_renewals || siteConfig.rules.maxRenewals).toString()
  );
  const [finePerDay, setFinePerDay] = React.useState(
    (initialSettings.fine_per_day || siteConfig.rules.finePerDay).toString()
  );
  const [gracePeriodDays, setGracePeriodDays] = React.useState(
    (initialSettings.grace_period_days || siteConfig.rules.gracePeriodDays).toString()
  );
  const [aiEnabled, setAiEnabled] = React.useState(
    initialSettings.ai_enabled ?? true
  );
  const [threeDEnabled, setThreeDEnabled] = React.useState(
    initialSettings.three_d_enabled ?? true
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          library_name: libraryName,
          tagline,
          loan_period_days: parseInt(loanPeriodDays, 10),
          max_books_per_member: parseInt(maxBooksPerMember, 10),
          max_renewals: parseInt(maxRenewals, 10),
          fine_per_day: parseFloat(finePerDay),
          grace_period_days: parseInt(gracePeriodDays, 10),
          ai_enabled: aiEnabled,
          three_d_enabled: threeDEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to save settings");
      } else {
        toast.success("Settings saved! Changes are now active across the system.");
        router.refresh();
      }
    } catch {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {/* Branding Section */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-bold text-base">Branding & Identity</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">
              Library Name
            </label>
            <input
              type="text"
              required
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">
              Motto / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>
        </div>
      </div>

      {/* Circulation Policy Rules */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-accent" />
          <h3 className="font-serif font-bold text-base">Circulation & Fine Rules</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">
              Loan Period (Days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={loanPeriodDays}
              onChange={(e) => setLoanPeriodDays(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">
              Max Books Per Member
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxBooksPerMember}
              onChange={(e) => setMaxBooksPerMember(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">
              Max Renewals
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={maxRenewals}
              onChange={(e) => setMaxRenewals(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">
              Overdue Fine / Day ($)
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={finePerDay}
              onChange={(e) => setFinePerDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">
              Grace Period (Days)
            </label>
            <input
              type="number"
              min="0"
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-bold text-base">Feature Toggles</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer">
            <div>
              <div className="font-semibold text-foreground">
                AI Librarian & Semantic Catalog Assistant
              </div>
              <div className="text-muted-foreground">
                Enables natural language book recommendations and chat
              </div>
            </div>
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-primary accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer">
            <div>
              <div className="font-semibold text-foreground">
                3D Bookshelf & Hero Scene
              </div>
              <div className="text-muted-foreground">
                Renders interactive Three.js 3D books on home page (with CSS fallback)
              </div>
            </div>
            <input
              type="checkbox"
              checked={threeDEnabled}
              onChange={(e) => setThreeDEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-primary accent-primary"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:opacity-95 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}
