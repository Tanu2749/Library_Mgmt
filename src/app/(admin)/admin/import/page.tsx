import { CsvImporter } from "@/components/admin/CsvImporter";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Bulk Inventory Import
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Batch upload titles via CSV. Authors and genres will be automatically indexed.
        </p>
      </div>

      <CsvImporter />
    </div>
  );
}
