import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import { csvBookRowSchema } from "@/lib/validators";

describe("CSV Import Validation", () => {
  const sampleCsvData = `title,author,genre,isbn,publishedYear,totalCopies
"The Left Hand of Darkness","Ursula K. Le Guin","Science Fiction","9780441478125",1969,3
"","Missing Title","Fiction","9780000000000",2020,1
"Valid Book Two","Author Two","Mystery","9781111111111",2021,2`;

  it("identifies valid vs invalid rows with detailed error reporting", () => {
    const parsed = Papa.parse(sampleCsvData, {
      header: true,
      skipEmptyLines: true,
    });

    const valid: any[] = [];
    const invalid: any[] = [];

    parsed.data.forEach((row: any, idx) => {
      const result = csvBookRowSchema.safeParse(row);
      if (result.success) {
        valid.push(result.data);
      } else {
        invalid.push({
          row: idx + 2,
          errors: result.error.issues.map((i) => i.message),
        });
      }
    });

    expect(valid.length).toBe(2);
    expect(invalid.length).toBe(1);
    expect(invalid[0].row).toBe(3); // row 3 is missing title
    expect(invalid[0].errors).toContain("Title is required");
  });

  it("transforms string copy counts and published years into numbers", () => {
    const row = {
      title: "Clean Code",
      author: "Robert C. Martin",
      totalCopies: "5",
      publishedYear: "2008",
    };

    const result = csvBookRowSchema.parse(row);
    expect(result.totalCopies).toBe(5);
    expect(result.publishedYear).toBe(2008);
  });
});
