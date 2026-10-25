import { getSystemSettings } from "@/lib/db/queries/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const currentSettings = await getSystemSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          System & Circulation Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure branding, loan limits, overdue fee policies, and feature toggles without modifying code.
        </p>
      </div>

      <SettingsForm initialSettings={currentSettings} />
    </div>
  );
}
