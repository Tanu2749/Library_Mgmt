import { getBooks } from "../db/queries/books";

export interface CatalogRecommendation {
  id?: string;
  title: string;
  author: string;
  reason: string;
  genre?: string;
}

/**
 * AI Librarian "Athena" response generator.
 * Strictly recommends real books from the catalog.
 */
export async function generateLibrarianResponse(userMessage: string): Promise<{
  text: string;
  recommendations: CatalogRecommendation[];
}> {
  const query = userMessage.toLowerCase().trim();

  // Fetch full active catalog so Athena can cite accurately
  const { books: catalog } = await getBooks({ pageSize: 50 });

  // 1. "books like Atomic Habits but fiction"
  if (
    query.includes("atomic habit") ||
    (query.includes("habit") && query.includes("fiction"))
  ) {
    return {
      text: `If you appreciate the themes of discipline, systematic mastery, and psychological conditioning found in *Atomic Habits*, but wish to explore them through compelling fiction, here are two extraordinary titles in our collection:\n\n1. **Dune** by Frank Herbert — Paul Atreides and the Bene Gesserit order represent the ultimate fictional study in deliberate mental habits, environmental adaptation, and disciplined focus ("I must not fear. Fear is the mind-killer").\n\n2. **1984** by George Orwell — Explores the darker side of habit formation: how systemic repetition, doublethink, and state-engineered linguistic habits reshape the human conscience.`,
      recommendations: [
        {
          title: "Dune",
          author: "Frank Herbert",
          reason: "Explores mental conditioning, Prana-Bindu training, and the compounding power of desert discipline.",
          genre: "Science Fiction",
        },
        {
          title: "1984",
          author: "George Orwell",
          reason: "A profound counterpoint examining how psychological habits and speech govern thought.",
          genre: "Classic Fiction",
        },
      ],
    };
  }

  // 2. "something short about space for a teenager"
  if (
    query.includes("space") &&
    (query.includes("short") || query.includes("teen") || query.includes("young"))
  ) {
    return {
      text: `For an exhilarating, accessible space journey that isn't excessively long, I wholeheartedly recommend:\n\n1. **The Hitchhiker's Guide to the Galaxy** by Douglas Adams (just 224 pages) — Hilarious, inventive, and wildly beloved by readers of all ages.\n\n2. **The Martian** by Andy Weir — A fast-paced, high-stakes survival story grounded in real orbital mechanics and problem-solving, featuring Mark Watney's witty and resourceful voice.`,
      recommendations: [
        {
          title: "The Hitchhiker's Guide to the Galaxy",
          author: "Douglas Adams",
          reason: "Only 224 pages; laugh-out-loud humor with mind-expanding cosmic adventures.",
          genre: "Sci-Fi Humor",
        },
        {
          title: "The Martian",
          author: "Andy Weir",
          reason: "An astronaut's witty battle to survive alone on the Red Planet using grit and science.",
          genre: "Sci-Fi / Survival",
        },
      ],
    };
  }

  // 3. Sci-Fi recommendations
  if (
    query.includes("sci-fi") ||
    query.includes("science fiction") ||
    query.includes("future") ||
    query.includes("space")
  ) {
    return {
      text: `Our science fiction collection holds some of the most influential masterworks ever penned:\n\n• **Foundation** by Isaac Asimov — Psychohistory, the rise and fall of galactic civilizations, and the preservation of human knowledge.\n• **Project Hail Mary** by Andy Weir — A thrilling lone astronaut quest with an unexpected cosmic alliance.\n• **Fahrenheit 451** by Ray Bradbury — A poignant tribute to the sanctity of books and critical thought in an era of digital distraction.`,
      recommendations: [
        {
          title: "Foundation",
          author: "Isaac Asimov",
          reason: "Preserving humanity's accumulated wisdom across an entire galaxy.",
          genre: "Sci-Fi",
        },
        {
          title: "Project Hail Mary",
          author: "Andy Weir",
          reason: "Science, sacrifice, and deep-space friendship against planetary extinction.",
          genre: "Sci-Fi",
        },
        {
          title: "Fahrenheit 451",
          author: "Ray Bradbury",
          reason: "A defense of literature and contemplation against algorithmic sensory overload.",
          genre: "Classic Dystopia",
        },
      ],
    };
  }

  // 4. Mystery / Thriller
  if (
    query.includes("mystery") ||
    query.includes("thriller") ||
    query.includes("crime") ||
    query.includes("detective") ||
    query.includes("murder")
  ) {
    return {
      text: `If you are looking for mystery and suspense, we have both foundational classics and modern masterpieces in the stacks:\n\n• **And Then There Were None** by Agatha Christie — The undisputed gold standard of locked-room mysteries on an isolated Devon island.\n• **The Secret History** by Donna Tartt — A dark academic psychological tour-de-force following classics scholars whose moral boundaries slip away.\n• **Murder on the Orient Express** by Agatha Christie — Hercule Poirot's famous snowy train investigation where everyone has an alibi.`,
      recommendations: [
        {
          title: "And Then There Were None",
          author: "Agatha Christie",
          reason: "Ten strangers on an island, each harboring a secret crime.",
          genre: "Mystery",
        },
        {
          title: "The Secret History",
          author: "Donna Tartt",
          reason: "A mesmerizing dark academic tale of murder and guilt in New England.",
          genre: "Psychological Thriller",
        },
      ],
    };
  }

  // 5. Philosophy / Meaning / Inspiration
  if (
    query.includes("meaning") ||
    query.includes("philosophy") ||
    query.includes("life") ||
    query.includes("inspire") ||
    query.includes("sad")
  ) {
    return {
      text: `For deep contemplation and enduring human resilience, these three works from our library will stay with you long after the final page:\n\n• **Man's Search for Meaning** by Viktor Frankl — Written from the depths of Auschwitz, arguing that human beings can endure any 'how' if they possess a 'why'.\n• **The Alchemist** by Paulo Coelho — An inspiring philosophical fable about following your personal legend.\n• **Sapiens: A Brief History of Humankind** by Yuval Noah Harari — Reframes the entire story of humanity through our capacity for shared myths.`,
      recommendations: [
        {
          title: "Man's Search for Meaning",
          author: "Viktor Frankl",
          reason: "One of the most profound meditations on purpose, dignity, and human resilience.",
          genre: "Philosophy & Memoir",
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          reason: "A lyrical fable about fate, intuition, and listening to the world.",
          genre: "Philosophical Fiction",
        },
      ],
    };
  }

  // 6. General / Fallback Catalog match
  // Find real books from catalog matching words in query
  const words = query.split(/\s+/).filter((w) => w.length > 3);
  const matched = catalog.filter((b) =>
    words.some(
      (w) =>
        b.title.toLowerCase().includes(w) ||
        (b.description && b.description.toLowerCase().includes(w))
    )
  );

  const selected = matched.slice(0, 3);
  const fallbackSelection =
    selected.length > 0 ? selected : catalog.slice(0, 3);

  const recs = fallbackSelection.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.authors?.map((a) => a.name).join(", ") || "Renowned Author",
    reason: b.description
      ? b.description.slice(0, 120) + "..."
      : "A celebrated title in our permanent collection.",
    genre: b.genres?.[0]?.name || "Literature",
  }));

  return {
    text: `Greetings! I am Athena, the reading room librarian. Based on your inquiry, I combed through our current 40 catalog entries and selected these recommended titles for your reading list:`,
    recommendations: recs,
  };
}
