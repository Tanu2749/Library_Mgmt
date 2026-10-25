import { getBooks, getAllGenres, getAllAuthors } from "@/lib/db/queries/books";
import { BookCrudManager } from "@/components/admin/BookCrudManager";

export default async function AdminBooksPage() {
  const [{ books: allBooks }, genresList, authorsList] = await Promise.all([
    getBooks({ pageSize: 100 }),
    getAllGenres(),
    getAllAuthors(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Book Catalog Management
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Create, update, inspect copies, and maintain the library inventory.
        </p>
      </div>

      <BookCrudManager
        initialBooks={allBooks}
        genres={genresList}
        authors={authorsList}
      />
    </div>
  );
}
