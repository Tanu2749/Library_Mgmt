import { db } from "../src/lib/db/client";
import { books } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function updateCovers() {
  console.log("Updating all book covers to high-resolution Open Library artwork...");
  const allBooks = await db.select().from(books);

  let updatedCount = 0;
  for (const b of allBooks) {
    if (b.isbn) {
      const realCover = `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg`;
      await db
        .update(books)
        .set({ coverUrl: realCover, updatedAt: new Date() })
        .where(eq(books.id, b.id));
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} books to real Open Library cover artwork!`);
  process.exit(0);
}

updateCovers().catch((err) => {
  console.error("Error updating covers:", err);
  process.exit(1);
});
