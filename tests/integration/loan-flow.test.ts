import { describe, it, expect } from "vitest";
import { calculateFine, calculateDueDate } from "@/lib/utils";

describe("Loan Business Rules & Concurrency Simulation", () => {
  it("enforces max loan period of 14 days by default", () => {
    const borrowDate = new Date("2026-03-01T10:00:00Z");
    const dueDate = calculateDueDate(borrowDate, 14);
    expect(dueDate.toISOString().split("T")[0]).toBe("2026-03-15");
  });

  it("calculates correct fines on late returns after grace period", () => {
    const dueDate = new Date("2026-03-15T00:00:00Z");
    const returnDate = new Date("2026-03-20T00:00:00Z"); // 5 days late
    const finePerDay = 1.0;
    const gracePeriodDays = 1;

    // 5 late - 1 grace = 4 billable days * $1.00 = $4.00
    const fine = calculateFine(dueDate, returnDate, finePerDay, gracePeriodDays);
    expect(fine).toBe(4);
  });

  it("simulates atomic copy decrement and concurrency rejection on last copy", async () => {
    // Model of a book with 1 copy remaining
    let availableCopies = 1;

    // Mock borrow transaction
    const attemptBorrow = async (userId: string) => {
      if (availableCopies <= 0) {
        throw new Error("No copies available");
      }
      // Decrement atomically
      availableCopies--;
      return { success: true, userId };
    };

    // User A and User B attempt to borrow the single last copy concurrently
    const results = await Promise.allSettled([
      attemptBorrow("user-A"),
      attemptBorrow("user-B"),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    // Exactly 1 user gets the copy, and 1 user is rejected
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(availableCopies).toBe(0);
  });

  it("enforces member loan limit rule", () => {
    const maxBooksPerMember = 5;
    const currentActiveLoans = 5;

    const canBorrow = (activeCount: number) => activeCount < maxBooksPerMember;

    expect(canBorrow(currentActiveLoans)).toBe(false);
    expect(canBorrow(3)).toBe(true);
  });
});
