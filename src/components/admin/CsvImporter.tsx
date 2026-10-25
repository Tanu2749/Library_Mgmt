"use client";

import * as React from "react";
import Papa from "papaparse";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Download } from "lucide-react";
import { csvBookRowSchema } from "@/lib/validators";
import { toast } from "sonner";

interface ValidationResult {
  valid: any[];
  invalid: { row: number; data: any; errors: string[] }[];
}

export function CsvImporter() {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [results, setResults] = React.useState<ValidationResult | null>(null);
  const [importing, setImporting] = React.useState(false);

  const sampleCsv = `title,author,genre,isbn,publishedYear,totalCopies,description
"The Left Hand of Darkness","Ursula K. Le Guin","Science Fiction","9780441478125",1969,3,"A groundbreaking work of speculative fiction exploring gender and human nature."
"Neuromancer","William Gibson","Science Fiction","9780441569595",1984,2,"The seminal cyberpunk novel that introduced cyberspace and the matrix."
"Beloved","Toni Morrison","Fiction","9781400033416",1987,3,"A spellbinding novel exploring the trauma and legacy of slavery."`;

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "athenaeum_sample_books.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      parseCsv(f);
    }
  };

  const parseCsv = (csvFile: File) => {
    setParsing(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const valid: any[] = [];
        const invalid: { row: number; data: any; errors: string[] }[] = [];

        res.data.forEach((row: any, idx) => {
          const parsed = csvBookRowSchema.safeParse(row);
          if (parsed.success) {
            valid.push(parsed.data);
          } else {
            invalid.push({
              row: idx + 2, // 1-indexed header + 1
              data: row,
              errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
            });
          }
        });

        setResults({ valid, invalid });
        setParsing(false);
        toast.info(
          `Analyzed ${res.data.length} rows: ${valid.length} valid, ${invalid.length} warnings/errors`
        );
      },
      error: () => {
        toast.error("Failed to parse CSV file");
        setParsing(false);
      },
    });
  };

  const handleImport = async () => {
    if (!results || results.valid.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch("/api/books/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ books: results.valid }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Import failed");
      } else {
        toast.success(`Successfully imported ${data.count || results.valid.length} titles into the catalog!`);
        setFile(null);
        setResults(null);
      }
    } catch {
      toast.error("Network error during import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="p-8 rounded-3xl bg-card border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">Upload CSV Inventory File</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Import hundreds of books at once. Column headers expected: <code>title, author, genre, isbn, publishedYear, totalCopies, description</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <label className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs cursor-pointer hover:opacity-95 shadow-xs">
            <span>Select CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={downloadSample}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Validation Report */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <div>
                <span className="text-xl font-bold text-foreground">
                  {results.valid.length}
                </span>
                <p className="text-xs text-muted-foreground">Valid Ready to Import</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <div>
                <span className="text-xl font-bold text-foreground">
                  {results.invalid.length}
                </span>
                <p className="text-xs text-muted-foreground">Rows with Errors / Skipped</p>
              </div>
            </div>
          </div>

          {/* Invalid rows report */}
          {results.invalid.length > 0 && (
            <div className="p-4 rounded-2xl bg-card border border-border text-xs space-y-2">
              <h4 className="font-semibold text-destructive">
                Validation Warnings & Issues
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {results.invalid.map((inv, idx) => (
                  <div key={idx} className="p-2 rounded bg-muted/50 text-[11px]">
                    <span className="font-bold">Row {inv.row}:</span>{" "}
                    {inv.errors.join(", ")} — <em>&quot;{inv.data.title || "Untitled"}&quot;</em>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import commit button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setResults(null)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing || results.valid.length === 0}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              {importing
                ? "Importing records..."
                : `Commit Import (${results.valid.length} Books)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
