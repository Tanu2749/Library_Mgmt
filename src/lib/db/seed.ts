import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as PgPool } from "pg";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

const {
  users,
  authors,
  genres,
  books,
  bookAuthors,
  bookGenres,
  settings,
} = schema;

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is required for seeding.");
    process.exit(1);
  }

  const isNeon = connectionString.includes("neon.tech");
  const pool = isNeon
    ? new NeonPool({ connectionString })
    : new PgPool({ connectionString });
  const db = isNeon
    ? drizzleNeon(pool as NeonPool, { schema })
    : drizzleNode(pool as PgPool, { schema });

  // Check if already seeded
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log("✅ Database already seeded. Skipping.");
    await pool.end();
    return;
  }

  console.log("🌱 Seeding database...\n");

  // ─── Enable pgvector ───
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);

  // ─── Users ───
  const passwordHash = await hash("demo1234!", 12);

  const [adminUser] = await db
    .insert(users)
    .values([
      {
        name: "Admin User",
        email: "admin@demo.com",
        passwordHash,
        role: "ADMIN",
      },
      {
        name: "Sarah the Librarian",
        email: "librarian@demo.com",
        passwordHash,
        role: "LIBRARIAN",
      },
      {
        name: "Alex Reader",
        email: "member@demo.com",
        passwordHash,
        role: "MEMBER",
      },
    ])
    .returning();

  console.log("  ✓ 3 demo users created");

  // ─── Genres ───
  const genreData = [
    { name: "Fiction", slug: "fiction", description: "Imaginative narratives and stories" },
    { name: "Non-Fiction", slug: "non-fiction", description: "Factual works based on real events" },
    { name: "Science Fiction", slug: "sci-fi", description: "Speculative fiction exploring futuristic concepts" },
    { name: "Fantasy", slug: "fantasy", description: "Magical and supernatural narratives" },
    { name: "Mystery", slug: "mystery", description: "Stories centered on solving crimes or puzzles" },
    { name: "Thriller", slug: "thriller", description: "Suspenseful and fast-paced narratives" },
    { name: "Romance", slug: "romance", description: "Stories focused on love and relationships" },
    { name: "Biography", slug: "biography", description: "Accounts of real people's lives" },
    { name: "History", slug: "history", description: "Explorations of past events and eras" },
    { name: "Science", slug: "science", description: "Books about scientific topics and discoveries" },
    { name: "Philosophy", slug: "philosophy", description: "Explorations of fundamental questions about existence" },
    { name: "Self-Help", slug: "self-help", description: "Guides for personal development" },
    { name: "Technology", slug: "technology", description: "Books about computing, AI, and tech trends" },
    { name: "Poetry", slug: "poetry", description: "Collections of verse and lyrical writing" },
    { name: "Young Adult", slug: "young-adult", description: "Fiction aimed at teenage readers" },
    { name: "Classic", slug: "classic", description: "Timeless literary works" },
  ];

  const insertedGenres = await db.insert(genres).values(genreData).returning();
  const genreMap = Object.fromEntries(insertedGenres.map((g) => [g.slug, g.id]));
  console.log(`  ✓ ${insertedGenres.length} genres created`);

  // ─── Authors ───
  const authorData = [
    { name: "Frank Herbert", bio: "American science-fiction author known for the Dune series" },
    { name: "George Orwell", bio: "English novelist and essayist, author of 1984 and Animal Farm" },
    { name: "Jane Austen", bio: "English novelist known for romantic fiction set among the landed gentry" },
    { name: "Yuval Noah Harari", bio: "Israeli historian and author of Sapiens" },
    { name: "James Clear", bio: "Author and speaker on habits and continuous improvement" },
    { name: "Tara Westover", bio: "American memoirist and historian" },
    { name: "Michelle Obama", bio: "Former First Lady of the United States" },
    { name: "Delia Owens", bio: "American author and wildlife scientist" },
    { name: "Andy Weir", bio: "American novelist known for The Martian" },
    { name: "Madeline Miller", bio: "American novelist specializing in Greek mythology retellings" },
    { name: "Agatha Christie", bio: "English writer known as the Queen of Mystery" },
    { name: "Isaac Asimov", bio: "Russian-American author and professor of biochemistry" },
    { name: "Gabriel García Márquez", bio: "Colombian novelist and Nobel Prize winner" },
    { name: "Haruki Murakami", bio: "Japanese writer of surreal and melancholic fiction" },
    { name: "Chimamanda Ngozi Adichie", bio: "Nigerian writer of novels, short stories, and nonfiction" },
    { name: "Carl Sagan", bio: "American astronomer and science communicator" },
    { name: "Mary Shelley", bio: "English novelist who wrote Frankenstein" },
    { name: "Douglas Adams", bio: "English author and humourist" },
    { name: "Margaret Atwood", bio: "Canadian poet, novelist, and environmental activist" },
    { name: "J.R.R. Tolkien", bio: "English writer and philologist, author of The Lord of the Rings" },
    { name: "Viktor Frankl", bio: "Austrian psychiatrist and Holocaust survivor" },
    { name: "Paulo Coelho", bio: "Brazilian lyricist and novelist" },
    { name: "Ray Bradbury", bio: "American author known for Fahrenheit 451" },
    { name: "Fyodor Dostoevsky", bio: "Russian novelist and philosopher" },
    { name: "Khaled Hosseini", bio: "Afghan-American novelist" },
    { name: "Donna Tartt", bio: "American novelist" },
    { name: "Kazuo Ishiguro", bio: "British novelist, Nobel Prize winner" },
    { name: "Ta-Nehisi Coates", bio: "American journalist and author" },
    { name: "Rebecca Skloot", bio: "American science writer" },
    { name: "Erik Larson", bio: "American journalist and author of narrative non-fiction" },
  ];

  const insertedAuthors = await db.insert(authors).values(authorData).returning();
  const authorMap = Object.fromEntries(insertedAuthors.map((a) => [a.name, a.id]));
  console.log(`  ✓ ${insertedAuthors.length} authors created`);

  // ─── Books ───
  // Cover URL generator using a deterministic placeholder
  const cover = (title: string) =>
    `https://placehold.co/400x600/1a1a2e/e0d5c1?text=${encodeURIComponent(title.split(" ").slice(0, 3).join("\n"))}&font=playfair-display`;

  const bookData: {
    title: string;
    subtitle?: string;
    isbn: string;
    description: string;
    coverUrl: string;
    language: string;
    pageCount: number;
    publishedYear: number;
    publisher: string;
    totalCopies: number;
    availableCopies: number;
    tags: string[];
    authorNames: string[];
    genreSlugs: string[];
  }[] = [
    {
      title: "Dune",
      subtitle: "Book One of the Dune Chronicles",
      isbn: "9780441013593",
      description: "Set on the desert planet Arrakis, Dune is the story of Paul Atreides, who would become the mysterious man known as Muad'Dib. A sweeping tale of politics, ecology, religion, and human potential.",
      coverUrl: cover("Dune"),
      language: "English",
      pageCount: 688,
      publishedYear: 1965,
      publisher: "Ace Books",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["epic", "desert", "politics", "ecology"],
      authorNames: ["Frank Herbert"],
      genreSlugs: ["sci-fi", "fiction"],
    },
    {
      title: "1984",
      isbn: "9780451524935",
      description: "A dystopian novel set in a totalitarian society ruled by Big Brother. A masterpiece of political fiction and a terrifying vision of a future where freedom is an illusion.",
      coverUrl: cover("1984"),
      language: "English",
      pageCount: 328,
      publishedYear: 1949,
      publisher: "Secker & Warburg",
      totalCopies: 4,
      availableCopies: 4,
      tags: ["dystopia", "surveillance", "totalitarian", "classic"],
      authorNames: ["George Orwell"],
      genreSlugs: ["fiction", "classic"],
    },
    {
      title: "Pride and Prejudice",
      isbn: "9780141439518",
      description: "A witty comedy of manners that follows the Bennet sisters as they navigate love, society, and personal growth in Regency-era England.",
      coverUrl: cover("Pride and Prejudice"),
      language: "English",
      pageCount: 432,
      publishedYear: 1813,
      publisher: "T. Egerton",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["romance", "society", "regency", "classic"],
      authorNames: ["Jane Austen"],
      genreSlugs: ["fiction", "romance", "classic"],
    },
    {
      title: "Sapiens",
      subtitle: "A Brief History of Humankind",
      isbn: "9780062316097",
      description: "A groundbreaking narrative that surveys the entire length of human history, from the Stone Age to the Silicon Age.",
      coverUrl: cover("Sapiens"),
      language: "English",
      pageCount: 464,
      publishedYear: 2011,
      publisher: "Harper",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["history", "anthropology", "evolution", "civilization"],
      authorNames: ["Yuval Noah Harari"],
      genreSlugs: ["non-fiction", "history", "science"],
    },
    {
      title: "Atomic Habits",
      subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      isbn: "9780735211292",
      description: "A practical guide that reveals how small behavioral changes can lead to remarkable results. Backed by scientific research on habit formation.",
      coverUrl: cover("Atomic Habits"),
      language: "English",
      pageCount: 320,
      publishedYear: 2018,
      publisher: "Avery",
      totalCopies: 5,
      availableCopies: 5,
      tags: ["habits", "productivity", "psychology", "self-improvement"],
      authorNames: ["James Clear"],
      genreSlugs: ["non-fiction", "self-help"],
    },
    {
      title: "Educated",
      subtitle: "A Memoir",
      isbn: "9780399590504",
      description: "A memoir about a young woman who grows up in a survivalist family in rural Idaho and eventually earns a PhD from Cambridge University.",
      coverUrl: cover("Educated"),
      language: "English",
      pageCount: 334,
      publishedYear: 2018,
      publisher: "Random House",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["memoir", "education", "resilience", "family"],
      authorNames: ["Tara Westover"],
      genreSlugs: ["non-fiction", "biography"],
    },
    {
      title: "Becoming",
      isbn: "9781524763138",
      description: "An intimate and powerful memoir by the former First Lady of the United States, chronicling her journey from the South Side of Chicago to the White House.",
      coverUrl: cover("Becoming"),
      language: "English",
      pageCount: 448,
      publishedYear: 2018,
      publisher: "Crown",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["memoir", "inspiration", "politics", "leadership"],
      authorNames: ["Michelle Obama"],
      genreSlugs: ["non-fiction", "biography"],
    },
    {
      title: "Where the Crawdads Sing",
      isbn: "9780735219090",
      description: "A coming-of-age story set in the marshlands of North Carolina, blending a murder mystery with a love story and a celebration of the natural world.",
      coverUrl: cover("Where the Crawdads Sing"),
      language: "English",
      pageCount: 368,
      publishedYear: 2018,
      publisher: "G.P. Putnam's Sons",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["mystery", "nature", "coming-of-age", "romance"],
      authorNames: ["Delia Owens"],
      genreSlugs: ["fiction", "mystery"],
    },
    {
      title: "The Martian",
      isbn: "9780553418026",
      description: "Stranded on Mars with no way to signal Earth, astronaut Mark Watney must draw on his ingenuity and spirit to survive. A celebration of human resilience and science.",
      coverUrl: cover("The Martian"),
      language: "English",
      pageCount: 369,
      publishedYear: 2011,
      publisher: "Crown",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["survival", "mars", "science", "humor"],
      authorNames: ["Andy Weir"],
      genreSlugs: ["sci-fi", "fiction"],
    },
    {
      title: "Circe",
      isbn: "9780316556347",
      description: "A retelling of the story of Circe, the enchantress from Greek mythology who transforms Odysseus's men into pigs. A tale of love, loss, and self-discovery.",
      coverUrl: cover("Circe"),
      language: "English",
      pageCount: 393,
      publishedYear: 2018,
      publisher: "Little, Brown",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["mythology", "feminism", "gods", "transformation"],
      authorNames: ["Madeline Miller"],
      genreSlugs: ["fiction", "fantasy"],
    },
    {
      title: "And Then There Were None",
      isbn: "9780062073488",
      description: "Ten strangers are lured to an isolated island, and one by one they begin to die. Agatha Christie's masterpiece of suspense.",
      coverUrl: cover("And Then There Were None"),
      language: "English",
      pageCount: 272,
      publishedYear: 1939,
      publisher: "Collins Crime Club",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["mystery", "island", "suspense", "classic"],
      authorNames: ["Agatha Christie"],
      genreSlugs: ["mystery", "thriller", "classic"],
    },
    {
      title: "Foundation",
      isbn: "9780553293357",
      description: "A mathematician devises a plan to preserve knowledge as the galactic empire crumbles. The first novel in Asimov's epic Foundation series.",
      coverUrl: cover("Foundation"),
      language: "English",
      pageCount: 244,
      publishedYear: 1951,
      publisher: "Gnome Press",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["galactic empire", "psychohistory", "science", "epic"],
      authorNames: ["Isaac Asimov"],
      genreSlugs: ["sci-fi", "fiction", "classic"],
    },
    {
      title: "One Hundred Years of Solitude",
      isbn: "9780060883287",
      description: "The multi-generational story of the Buendía family in the mythical town of Macondo. A landmark of magical realism and world literature.",
      coverUrl: cover("One Hundred Years of Solitude"),
      language: "English",
      pageCount: 417,
      publishedYear: 1967,
      publisher: "Harper & Row",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["magical realism", "family saga", "Latin America", "classic"],
      authorNames: ["Gabriel García Márquez"],
      genreSlugs: ["fiction", "classic"],
    },
    {
      title: "Norwegian Wood",
      isbn: "9780375704024",
      description: "A nostalgic story of loss, sexuality, and the passage of youth. Set in 1960s Tokyo, following a young student and two very different women.",
      coverUrl: cover("Norwegian Wood"),
      language: "English",
      pageCount: 296,
      publishedYear: 1987,
      publisher: "Kodansha",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["love", "loss", "Japan", "coming-of-age"],
      authorNames: ["Haruki Murakami"],
      genreSlugs: ["fiction"],
    },
    {
      title: "Americanah",
      isbn: "9780307455925",
      description: "A love story between Ifemelu and Obinze, set between Nigeria and America, exploring race, identity, and immigration with humor and heart.",
      coverUrl: cover("Americanah"),
      language: "English",
      pageCount: 477,
      publishedYear: 2013,
      publisher: "Knopf",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["immigration", "identity", "race", "love"],
      authorNames: ["Chimamanda Ngozi Adichie"],
      genreSlugs: ["fiction"],
    },
    {
      title: "Cosmos",
      isbn: "9780345539434",
      description: "A journey through 15 billion years of cosmic evolution, exploring the origins of life and the human species. Carl Sagan's magnum opus.",
      coverUrl: cover("Cosmos"),
      language: "English",
      pageCount: 396,
      publishedYear: 1980,
      publisher: "Random House",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["astronomy", "space", "universe", "science"],
      authorNames: ["Carl Sagan"],
      genreSlugs: ["non-fiction", "science"],
    },
    {
      title: "Frankenstein",
      subtitle: "Or, The Modern Prometheus",
      isbn: "9780141439471",
      description: "The story of Victor Frankenstein and the creature he brings to life. A pioneering work of science fiction and gothic horror.",
      coverUrl: cover("Frankenstein"),
      language: "English",
      pageCount: 280,
      publishedYear: 1818,
      publisher: "Lackington, Hughes",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["gothic", "horror", "creation", "classic"],
      authorNames: ["Mary Shelley"],
      genreSlugs: ["fiction", "sci-fi", "classic"],
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      isbn: "9780345391803",
      description: "Seconds before Earth is demolished to make way for a galactic bypass, Arthur Dent is rescued by his friend Ford Prefect. A hilarious space odyssey.",
      coverUrl: cover("Hitchhiker's Guide"),
      language: "English",
      pageCount: 224,
      publishedYear: 1979,
      publisher: "Pan Books",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["humor", "space", "adventure", "absurd"],
      authorNames: ["Douglas Adams"],
      genreSlugs: ["sci-fi", "fiction"],
    },
    {
      title: "The Handmaid's Tale",
      isbn: "9780385490818",
      description: "In the Republic of Gilead, a theocratic dictatorship, women are subjugated and used for reproduction. Offred narrates her harrowing experience.",
      coverUrl: cover("The Handmaid's Tale"),
      language: "English",
      pageCount: 311,
      publishedYear: 1985,
      publisher: "McClelland and Stewart",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["dystopia", "feminism", "totalitarian", "resistance"],
      authorNames: ["Margaret Atwood"],
      genreSlugs: ["fiction", "sci-fi"],
    },
    {
      title: "The Hobbit",
      isbn: "9780547928227",
      description: "Bilbo Baggins, a comfort-loving hobbit, is swept into an epic quest to reclaim the dwarf kingdom of Erebor from the fearsome dragon Smaug.",
      coverUrl: cover("The Hobbit"),
      language: "English",
      pageCount: 310,
      publishedYear: 1937,
      publisher: "George Allen & Unwin",
      totalCopies: 4,
      availableCopies: 4,
      tags: ["adventure", "dragon", "quest", "classic"],
      authorNames: ["J.R.R. Tolkien"],
      genreSlugs: ["fantasy", "fiction", "classic"],
    },
    {
      title: "Man's Search for Meaning",
      isbn: "9780807014295",
      description: "A psychiatrist's memoir of life in Nazi death camps, and how the experience led to his theory that the primary human drive is the search for meaning.",
      coverUrl: cover("Man's Search for Meaning"),
      language: "English",
      pageCount: 184,
      publishedYear: 1946,
      publisher: "Beacon Press",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["holocaust", "meaning", "psychology", "resilience"],
      authorNames: ["Viktor Frankl"],
      genreSlugs: ["non-fiction", "philosophy", "biography"],
    },
    {
      title: "The Alchemist",
      isbn: "9780062315007",
      description: "A shepherd boy named Santiago travels from Spain to Egypt searching for treasure, discovering that the real treasure lies within.",
      coverUrl: cover("The Alchemist"),
      language: "English",
      pageCount: 197,
      publishedYear: 1988,
      publisher: "HarperOne",
      totalCopies: 4,
      availableCopies: 4,
      tags: ["journey", "destiny", "spirituality", "fable"],
      authorNames: ["Paulo Coelho"],
      genreSlugs: ["fiction", "philosophy"],
    },
    {
      title: "Fahrenheit 451",
      isbn: "9781451673319",
      description: "In a future where books are banned and burned, fireman Guy Montag begins to question everything he knows about his society.",
      coverUrl: cover("Fahrenheit 451"),
      language: "English",
      pageCount: 194,
      publishedYear: 1953,
      publisher: "Ballantine Books",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["censorship", "dystopia", "books", "freedom"],
      authorNames: ["Ray Bradbury"],
      genreSlugs: ["sci-fi", "fiction", "classic"],
    },
    {
      title: "Crime and Punishment",
      isbn: "9780486415871",
      description: "A young student commits a murder and is consumed by guilt. A psychological masterpiece exploring morality, redemption, and the human soul.",
      coverUrl: cover("Crime and Punishment"),
      language: "English",
      pageCount: 545,
      publishedYear: 1866,
      publisher: "The Russian Messenger",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["psychology", "morality", "guilt", "classic"],
      authorNames: ["Fyodor Dostoevsky"],
      genreSlugs: ["fiction", "classic", "philosophy"],
    },
    {
      title: "The Kite Runner",
      isbn: "9781594631931",
      description: "A story of friendship, betrayal, and redemption set against the backdrop of Afghanistan's tumultuous modern history.",
      coverUrl: cover("The Kite Runner"),
      language: "English",
      pageCount: 371,
      publishedYear: 2003,
      publisher: "Riverhead Books",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["Afghanistan", "friendship", "redemption", "war"],
      authorNames: ["Khaled Hosseini"],
      genreSlugs: ["fiction"],
    },
    {
      title: "The Secret History",
      isbn: "9781400031702",
      description: "A group of elite classics students at a small Vermont college become involved in a murder. A dark academic thriller about obsession and moral decay.",
      coverUrl: cover("The Secret History"),
      language: "English",
      pageCount: 559,
      publishedYear: 1992,
      publisher: "Knopf",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["dark academia", "murder", "obsession", "college"],
      authorNames: ["Donna Tartt"],
      genreSlugs: ["fiction", "thriller", "mystery"],
    },
    {
      title: "Never Let Me Go",
      isbn: "9781400078776",
      description: "Three friends grow up at a seemingly idyllic English boarding school, slowly discovering the dark truth about their existence.",
      coverUrl: cover("Never Let Me Go"),
      language: "English",
      pageCount: 288,
      publishedYear: 2005,
      publisher: "Faber and Faber",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["dystopia", "identity", "love", "memory"],
      authorNames: ["Kazuo Ishiguro"],
      genreSlugs: ["fiction", "sci-fi"],
    },
    {
      title: "Between the World and Me",
      isbn: "9780451482211",
      description: "Written as a letter to his teenage son, Coates explores the reality of being Black in America, combining personal narrative with intellectual depth.",
      coverUrl: cover("Between the World and Me"),
      language: "English",
      pageCount: 152,
      publishedYear: 2015,
      publisher: "Spiegel & Grau",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["race", "America", "identity", "memoir"],
      authorNames: ["Ta-Nehisi Coates"],
      genreSlugs: ["non-fiction", "biography"],
    },
    {
      title: "The Immortal Life of Henrietta Lacks",
      isbn: "9781400052189",
      description: "The story of Henrietta Lacks, whose cancer cells were taken without consent and became vital for medical research. A tale of science, ethics, and family.",
      coverUrl: cover("Immortal Life Henrietta Lacks"),
      language: "English",
      pageCount: 381,
      publishedYear: 2010,
      publisher: "Crown",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["science", "ethics", "medicine", "biography"],
      authorNames: ["Rebecca Skloot"],
      genreSlugs: ["non-fiction", "science", "biography"],
    },
    {
      title: "The Devil in the White City",
      isbn: "9780375725609",
      description: "The true story of the 1893 Chicago World's Fair, interweaving the brilliant architect behind it with a serial killer lurking in its shadows.",
      coverUrl: cover("Devil White City"),
      language: "English",
      pageCount: 447,
      publishedYear: 2003,
      publisher: "Crown",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["true crime", "architecture", "history", "Chicago"],
      authorNames: ["Erik Larson"],
      genreSlugs: ["non-fiction", "history"],
    },
    {
      title: "Animal Farm",
      isbn: "9780451526342",
      description: "A satirical allegory of Soviet totalitarianism in which farm animals overthrow their human masters, only to establish their own oppressive regime.",
      coverUrl: cover("Animal Farm"),
      language: "English",
      pageCount: 112,
      publishedYear: 1945,
      publisher: "Secker & Warburg",
      totalCopies: 4,
      availableCopies: 4,
      tags: ["satire", "politics", "allegory", "classic"],
      authorNames: ["George Orwell"],
      genreSlugs: ["fiction", "classic"],
    },
    {
      title: "The Song of Achilles",
      isbn: "9780062060624",
      description: "A retelling of the Iliad from the perspective of Patroclus, exploring his deep bond with Achilles as they march toward the Trojan War.",
      coverUrl: cover("Song of Achilles"),
      language: "English",
      pageCount: 378,
      publishedYear: 2011,
      publisher: "Ecco",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["mythology", "love", "war", "Greece"],
      authorNames: ["Madeline Miller"],
      genreSlugs: ["fiction", "fantasy"],
    },
    {
      title: "Project Hail Mary",
      isbn: "9780593135204",
      description: "An astronaut wakes up alone on a spaceship with no memory, and must save Earth from an extinction-level threat. A thrilling space adventure.",
      coverUrl: cover("Project Hail Mary"),
      language: "English",
      pageCount: 476,
      publishedYear: 2021,
      publisher: "Ballantine Books",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["space", "survival", "science", "friendship"],
      authorNames: ["Andy Weir"],
      genreSlugs: ["sci-fi", "fiction"],
    },
    {
      title: "Kafka on the Shore",
      isbn: "9781400079278",
      description: "Two parallel stories—a teenage runaway and an old man who can talk to cats—converge in a surreal, dreamlike narrative about fate and free will.",
      coverUrl: cover("Kafka on the Shore"),
      language: "English",
      pageCount: 467,
      publishedYear: 2002,
      publisher: "Shinchōsha",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["surreal", "cats", "fate", "Japan"],
      authorNames: ["Haruki Murakami"],
      genreSlugs: ["fiction", "fantasy"],
    },
    {
      title: "The Lord of the Rings",
      subtitle: "The Fellowship of the Ring",
      isbn: "9780547928210",
      description: "The first volume of Tolkien's epic trilogy. Frodo Baggins inherits a ring of great power and must embark on a perilous quest to destroy it.",
      coverUrl: cover("Fellowship of the Ring"),
      language: "English",
      pageCount: 423,
      publishedYear: 1954,
      publisher: "George Allen & Unwin",
      totalCopies: 3,
      availableCopies: 3,
      tags: ["quest", "ring", "fellowship", "epic"],
      authorNames: ["J.R.R. Tolkien"],
      genreSlugs: ["fantasy", "fiction", "classic"],
    },
    {
      title: "21 Lessons for the 21st Century",
      isbn: "9780525512172",
      description: "A meditation on the pressing issues of our time—technology, truth, justice, and the meaning of life in an age of bewilderment.",
      coverUrl: cover("21 Lessons"),
      language: "English",
      pageCount: 372,
      publishedYear: 2018,
      publisher: "Spiegel & Grau",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["technology", "society", "philosophy", "future"],
      authorNames: ["Yuval Noah Harari"],
      genreSlugs: ["non-fiction", "philosophy"],
    },
    {
      title: "Murder on the Orient Express",
      isbn: "9780062693662",
      description: "Hercule Poirot investigates the murder of a wealthy American aboard the luxurious Orient Express. Every passenger is a suspect.",
      coverUrl: cover("Murder Orient Express"),
      language: "English",
      pageCount: 256,
      publishedYear: 1934,
      publisher: "Collins Crime Club",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["detective", "train", "mystery", "classic"],
      authorNames: ["Agatha Christie"],
      genreSlugs: ["mystery", "fiction", "classic"],
    },
    {
      title: "I, Robot",
      isbn: "9780553382563",
      description: "A collection of interconnected short stories exploring the three laws of robotics and their consequences for human-robot interactions.",
      coverUrl: cover("I, Robot"),
      language: "English",
      pageCount: 224,
      publishedYear: 1950,
      publisher: "Gnome Press",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["robots", "AI", "ethics", "future"],
      authorNames: ["Isaac Asimov"],
      genreSlugs: ["sci-fi", "fiction", "classic"],
    },
    {
      title: "A Thousand Splendid Suns",
      isbn: "9781594483851",
      description: "Two women born a generation apart in Afghanistan find their lives intertwined by war, loss, and the quest for survival and love.",
      coverUrl: cover("A Thousand Splendid Suns"),
      language: "English",
      pageCount: 372,
      publishedYear: 2007,
      publisher: "Riverhead Books",
      totalCopies: 2,
      availableCopies: 2,
      tags: ["Afghanistan", "women", "war", "resilience"],
      authorNames: ["Khaled Hosseini"],
      genreSlugs: ["fiction"],
    },
  ];

  // Insert books
  for (const book of bookData) {
    const { authorNames, genreSlugs, ...bookValues } = book;

    const [insertedBook] = await db
      .insert(books)
      .values(bookValues)
      .returning();

    // Link authors
    for (const authorName of authorNames) {
      const authorId = authorMap[authorName];
      if (authorId) {
        await db.insert(bookAuthors).values({
          bookId: insertedBook.id,
          authorId,
        });
      }
    }

    // Link genres
    for (const slug of genreSlugs) {
      const genreId = genreMap[slug];
      if (genreId) {
        await db.insert(bookGenres).values({
          bookId: insertedBook.id,
          genreId,
        });
      }
    }
  }

  console.log(`  ✓ ${bookData.length} books created with author/genre links`);

  // ─── Default Settings ───
  await db.insert(settings).values([
    { key: "library_name", value: JSON.stringify("Athenaeum") },
    { key: "tagline", value: JSON.stringify("Where Knowledge Finds You") },
    { key: "logo_url", value: JSON.stringify("/logo.svg") },
    { key: "loan_period_days", value: JSON.stringify(14) },
    { key: "max_books_per_member", value: JSON.stringify(5) },
    { key: "max_renewals", value: JSON.stringify(2) },
    { key: "fine_per_day", value: JSON.stringify(1.0) },
    { key: "fine_currency", value: JSON.stringify("USD") },
    { key: "grace_period_days", value: JSON.stringify(1) },
    { key: "reservation_hold_days", value: JSON.stringify(3) },
    { key: "ai_enabled", value: JSON.stringify(true) },
    { key: "three_d_enabled", value: JSON.stringify(true) },
    { key: "registration_open", value: JSON.stringify(true) },
    {
      key: "theme_colors",
      value: JSON.stringify({
        primary: "24 70% 45%",
        accent: "16 80% 55%",
      }),
    },
  ]);
  console.log("  ✓ Default settings created");

  console.log("\n🎉 Seed complete!\n");
  console.log("  Demo accounts (password: demo1234!):");
  console.log("    admin@demo.com      (ADMIN)");
  console.log("    librarian@demo.com  (LIBRARIAN)");
  console.log("    member@demo.com     (MEMBER)");
  console.log("\n  ⚠️  Change these passwords in production!\n");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
