import { describe, it, expect } from "vitest";
import {
  calculateFine,
  calculateDueDate,
  daysBetween,
  slugify,
  sanitize,
  truncate,
  formatCurrency,
} from "@/lib/utils";

describe("calculateFine", () => {
  it("returns 0 when returned on time", () => {
    const due = new Date("2024-01-15");
    const returned = new Date("2024-01-14");
    expect(calculateFine(due, returned, 1.0, 1)).toBe(0);
  });

  it("returns 0 within grace period", () => {
    const due = new Date("2024-01-15");
    const returned = new Date("2024-01-16"); // 1 day late, 1 day grace
    expect(calculateFine(due, returned, 1.0, 1)).toBe(0);
  });

  it("calculates fine after grace period", () => {
    const due = new Date("2024-01-15");
    const returned = new Date("2024-01-20"); // 5 days late, 1 day grace = $4
    expect(calculateFine(due, returned, 1.0, 1)).toBe(4);
  });

  it("calculates fine with different rate", () => {
    const due = new Date("2024-01-15");
    const returned = new Date("2024-01-25"); // 10 days late, 1 day grace = $13.5
    expect(calculateFine(due, returned, 1.5, 1)).toBe(13.5);
  });

  it("calculates fine with zero grace period", () => {
    const due = new Date("2024-01-15");
    const returned = new Date("2024-01-18"); // 3 days late, 0 grace = $3
    expect(calculateFine(due, returned, 1.0, 0)).toBe(3);
  });
});

describe("calculateDueDate", () => {
  it("adds correct number of days", () => {
    const borrow = new Date("2024-01-01");
    const due = calculateDueDate(borrow, 14);
    expect(due.toISOString().split("T")[0]).toBe("2024-01-15");
  });

  it("handles month boundaries", () => {
    const borrow = new Date("2024-01-25");
    const due = calculateDueDate(borrow, 14);
    expect(due.toISOString().split("T")[0]).toBe("2024-02-08");
  });
});

describe("daysBetween", () => {
  it("returns correct number of days", () => {
    const start = new Date("2024-01-01");
    const end = new Date("2024-01-10");
    expect(daysBetween(start, end)).toBe(9);
  });

  it("returns 0 for same day", () => {
    const date = new Date("2024-01-01");
    expect(daysBetween(date, date)).toBe(0);
  });

  it("returns negative for reverse order", () => {
    const start = new Date("2024-01-10");
    const end = new Date("2024-01-01");
    expect(daysBetween(start, end)).toBe(-9);
  });
});

describe("slugify", () => {
  it("converts to lowercase and replaces spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Science & Fiction!")).toBe("science-fiction");
  });

  it("handles multiple spaces", () => {
    expect(slugify("foo   bar")).toBe("foo-bar");
  });
});

describe("sanitize", () => {
  it("strips HTML tags", () => {
    expect(sanitize("<script>alert('xss')</script>")).toBe("alert('xss')");
  });

  it("trims whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });

  it("preserves normal text", () => {
    expect(sanitize("This is a normal text.")).toBe("This is a normal text.");
  });
});

describe("truncate", () => {
  it("returns text unchanged if shorter than max", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("This is a long text", 10)).toBe("This is...");
  });
});

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(9.5, "USD")).toBe("$9.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });
});
