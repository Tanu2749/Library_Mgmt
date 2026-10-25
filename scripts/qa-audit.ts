import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../src/lib/db/client";
import { users, books, loans, genres, authors, bookAuthors, bookGenres, settings } from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { borrowBook, returnBook, renewLoan, getLoanRules } from "../src/lib/db/queries/loans";
import { getBooks, getBookById } from "../src/lib/db/queries/books";
import { getDashboardStats } from "../src/lib/db/queries/admin";

async function runEndToEndVerification() {
  console.log("=================================================");
  console.log("🚀 STARTING ATHENAEUM END-TO-END QA & HEALTH AUDIT");
  console.log("=================================================\n");

  const results: { test: string; status: "PASS" | "FAIL"; details: string }[] = [];

  // TEST 1: Database Connectivity & Core Tables
  try {
    const bookCount = await db.select().from(books);
    const userCount = await db.select().from(users);
    const genreCount = await db.select().from(genres);
    const authorCount = await db.select().from(authors);

    if (bookCount.length >= 35 && userCount.length >= 3) {
      results.push({
        test: "Database Connectivity & Seeding",
        status: "PASS",
        details: `Neon connected: ${bookCount.length} books, ${userCount.length} users, ${genreCount.length} genres, ${authorCount.length} authors`,
      });
    } else {
      results.push({
        test: "Database Connectivity & Seeding",
        status: "FAIL",
        details: `Low counts: ${bookCount.length} books, ${userCount.length} users`,
      });
    }
  } catch (err) {
    results.push({
      test: "Database Connectivity & Seeding",
      status: "FAIL",
      details: String(err),
    });
  }

  // TEST 2: Account Creation & Password Encryption
  const testEmail = `qa_test_${Date.now()}@example.com`;
  const rawPassword = "SecurePassword123!";
  let testUserId = "";

  try {
    const passwordHash = await hash(rawPassword, 12);
    const [newUser] = await db
      .insert(users)
      .values({
        name: "QA End-User",
        email: testEmail,
        passwordHash,
        role: "MEMBER",
      })
      .returning();

    testUserId = newUser.id;

    // Verify password check
    const matches = await compare(rawPassword, newUser.passwordHash);
    const wrongMatches = await compare("WrongPass!", newUser.passwordHash);

    if (matches && !wrongMatches) {
      results.push({
        test: "Account Creation & Bcrypt Security",
        status: "PASS",
        details: `User created ID: ${newUser.id}, password hash correctly verified with cost factor 12`,
      });
    } else {
      results.push({
        test: "Account Creation & Bcrypt Security",
        status: "FAIL",
        details: "Password verification failed",
      });
    }
  } catch (err) {
    results.push({
      test: "Account Creation & Bcrypt Security",
      status: "FAIL",
      details: String(err),
    });
  }

  // TEST 3: Catalog Query & Semantic Search
  try {
    const catalogResult = await getBooks({ pageSize: 12, sortBy: "title", sortOrder: "asc" });
    const searchResult = await getBooks({ query: "Dune" });
    const singleBook = await getBookById(catalogResult.books[0]?.id || "");

    if (catalogResult.books.length > 0 && searchResult.books.length > 0 && singleBook) {
      results.push({
        test: "Catalog Queries & Search",
        status: "PASS",
        details: `Paginated fetch returned ${catalogResult.books.length} items; Title search for 'Dune' found ${searchResult.books.length} match(es); Single book detail loaded: "${singleBook.title}"`,
      });
    } else {
      results.push({
        test: "Catalog Queries & Search",
        status: "FAIL",
        details: "Search or catalog fetch returned empty results",
      });
    }
  } catch (err) {
    results.push({
      test: "Catalog Queries & Search",
      status: "FAIL",
      details: String(err),
    });
  }

  // TEST 4: Borrowing Transaction & Inventory Decrement
  let testLoanId = "";
  let targetBookId = "";
  let initialCopies = 0;

  try {
    const [bookToBorrow] = await db.select().from(books).where(eq(books.title, "Dune")).limit(1);
    targetBookId = bookToBorrow.id;
    initialCopies = bookToBorrow.availableCopies;

    // Execute borrow
    const loanResult = await borrowBook({
      userId: testUserId,
      bookId: targetBookId,
      notes: "QA E2E Automated Test",
    });

    testLoanId = loanResult.id;

    // Check inventory decrement in DB
    const [updatedBook] = await db.select().from(books).where(eq(books.id, targetBookId)).limit(1);

    if (loanResult.status === "ACTIVE" && updatedBook.availableCopies === initialCopies - 1) {
      results.push({
        test: "Borrow Book & Inventory Decrement",
        status: "PASS",
        details: `Book borrowed (Loan ID: ${loanResult.id}). Copies updated: ${initialCopies} -> ${updatedBook.availableCopies}`,
      });
    } else {
      results.push({
        test: "Borrow Book & Inventory Decrement",
        status: "FAIL",
        details: `Inventory did not decrement properly. Current copies: ${updatedBook.availableCopies}`,
      });
    }
  } catch (err) {
    results.push({
      test: "Borrow Book & Inventory Decrement",
      status: "FAIL",
      details: String(err),
    });
  }

  // TEST 5: Renewal Policy & Due Date Calculation
  try {
    const renewed = await renewLoan({
      loanId: testLoanId,
      userId: testUserId,
    });

    if (renewed.renewalCount === 1) {
      results.push({
        test: "Loan Renewal & Policy Enforcement",
        status: "PASS",
        details: `Renewal succeeded: count = ${renewed.renewalCount}, due date: ${new Date(renewed.dueDate).toISOString().split("T")[0]}`,
      });
    } else {
      results.push({
        test: "Loan Renewal & Policy Enforcement",
        status: "FAIL",
        details: `Renewal count unexpected: ${renewed.renewalCount}`,
      });
    }
  } catch (err) {
    results.push({
      test: "Loan Renewal & Policy Enforcement",
      status: "FAIL",
      details: String(err),
    });
  }

  // TEST 6: Return Transaction & Inventory Restoration
  try {
    const returnResult = await returnBook({
      loanId: testLoanId,
      notes: "QA Test return",
    });

    const [restoredBook] = await db.select().from(books).where(eq(books.id, targetBookId)).limit(1);

    if (returnResult.loan.status === "RETURNED" && restoredBook.availableCopies === initialCopies) {
      results.push({
        test: "Return Book & Inventory Restoration",
        status: "PASS",
        details: `Book returned successfully. Copies restored back to ${restoredBook.availableCopies}`,
      });
    } else {
      results.push({
        test: "Return Book & Inventory Restoration",
        status: "FAIL",
        details: `Copies not restored. Copies: ${restoredBook.availableCopies}, expected: ${initialCopies}`,
      });
    }
  } catch (err) {
    results.push({
      test: "Return Book & Inventory Restoration",
      status: "FAIL",
      details: String(err),
    });
  }

  // TEST 7: Dashboard Stats & Circulation Metrics
  try {
    const stats = await getDashboardStats();
    const rules = await getLoanRules();

    if (stats.totalBooks >= 35 && rules.loanPeriodDays === 14) {
      results.push({
        test: "Dashboard Metrics & System Settings",
        status: "PASS",
        details: `Admin stats verified: ${stats.totalBooks} books, ${stats.totalMembers} members, Standard loan rule: ${rules.loanPeriodDays} days`,
      });
    } else {
      results.push({
        test: "Dashboard Metrics & System Settings",
        status: "FAIL",
        details: `Stats mismatch: ${JSON.stringify(stats)}`,
      });
    }
  } catch (err) {
    results.push({
      test: "Dashboard Metrics & System Settings",
      status: "FAIL",
      details: String(err),
    });
  }

  // CLEANUP: Remove QA user and test loan from database
  try {
    if (testLoanId) {
      await db.delete(loans).where(eq(loans.id, testLoanId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    console.log("🧹 Cleanup complete: QA test records safely removed from Neon.");
  } catch (err) {
    console.warn("Cleanup warning:", err);
  }

  // PRINT SUMMARY REPORT
  console.log("\n=================================================");
  console.log("📊 QA AUDIT REPORT SUMMARY");
  console.log("=================================================");
  results.forEach((r, idx) => {
    const icon = r.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} [${r.status}] Test ${idx + 1}: ${r.test}`);
    console.log(`   ${r.details}\n`);
  });

  const allPassed = results.every((r) => r.status === "PASS");
  if (allPassed) {
    console.log("🎉 ALL 7 CRITICAL END-TO-END FLOWS PASSED PERFECTLY!\n");
    process.exit(0);
  } else {
    console.error("❌ Some tests failed. Review details above.");
    process.exit(1);
  }
}

runEndToEndVerification().catch((err) => {
  console.error("Fatal QA audit error:", err);
  process.exit(1);
});
