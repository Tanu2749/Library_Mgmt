import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility: merge Tailwind classes intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Format currency.
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Calculate days between two dates.
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Calculate fine amount for overdue books.
 */
export function calculateFine(
  dueDate: Date,
  returnDate: Date,
  finePerDay: number,
  gracePeriodDays: number = 1
): number {
  const overdueDays = daysBetween(dueDate, returnDate);
  if (overdueDays <= gracePeriodDays) return 0;
  return (overdueDays - gracePeriodDays) * finePerDay;
}

/**
 * Generate due date from borrow date and loan period.
 */
export function calculateDueDate(
  borrowDate: Date,
  loanPeriodDays: number
): Date {
  const due = new Date(borrowDate);
  due.setDate(due.getDate() + loanPeriodDays);
  return due;
}

/**
 * Slugify a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Sanitize user input: trim and strip potentially dangerous characters.
 */
export function sanitize(input: string): string {
  return input.trim().replace(/<[^>]*>/g, "");
}
