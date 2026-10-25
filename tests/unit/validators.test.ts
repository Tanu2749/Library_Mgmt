import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createBookSchema,
  searchSchema,
  createLoanSchema,
  chatMessageSchema,
  csvBookRowSchema,
  updateSettingsSchema,
} from "@/lib/validators";

describe("registerSchema", () => {
  it("validates correct input", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "not-an-email",
      password: "SecurePass1!",
    });
    expect(result.success).toBe(false);
  });

  it("trims and lowercases email", () => {
    const result = registerSchema.parse({
      name: "John",
      email: "  John@Example.COM  ",
      password: "SecurePass1!",
    });
    expect(result.email).toBe("john@example.com");
  });
});

describe("loginSchema", () => {
  it("validates correct input", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "any-password",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createBookSchema", () => {
  it("validates correct input", () => {
    const result = createBookSchema.safeParse({
      title: "Test Book",
      authorIds: [1],
      totalCopies: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createBookSchema.safeParse({
      authorIds: [1],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty authorIds", () => {
    const result = createBookSchema.safeParse({
      title: "Test",
      authorIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates ISBN format", () => {
    const valid13 = createBookSchema.safeParse({
      title: "Test",
      authorIds: [1],
      isbn: "9780141439518",
    });
    expect(valid13.success).toBe(true);

    const invalid = createBookSchema.safeParse({
      title: "Test",
      authorIds: [1],
      isbn: "invalid-isbn",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("searchSchema", () => {
  it("provides defaults for empty input", () => {
    const result = searchSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.sortBy).toBe("title");
    expect(result.sortOrder).toBe("asc");
    expect(result.availability).toBe("all");
  });
});

describe("createLoanSchema", () => {
  it("validates UUIDs", () => {
    const result = createLoanSchema.safeParse({
      userId: "not-a-uuid",
      bookId: "also-not-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("chatMessageSchema", () => {
  it("rejects empty message", () => {
    const result = chatMessageSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects overly long message", () => {
    const result = chatMessageSchema.safeParse({
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("csvBookRowSchema", () => {
  it("validates a basic CSV row", () => {
    const result = csvBookRowSchema.safeParse({
      title: "Test Book",
      author: "Author Name",
    });
    expect(result.success).toBe(true);
  });

  it("transforms page count from string", () => {
    const result = csvBookRowSchema.parse({
      title: "Test Book",
      author: "Author",
      pageCount: "350",
    });
    expect(result.pageCount).toBe(350);
  });
});

describe("updateSettingsSchema", () => {
  it("validates partial updates", () => {
    const result = updateSettingsSchema.safeParse({
      loan_period_days: 21,
      fine_per_day: 1.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid loan period", () => {
    const result = updateSettingsSchema.safeParse({
      loan_period_days: 0,
    });
    expect(result.success).toBe(false);
  });
});
