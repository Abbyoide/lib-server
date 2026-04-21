import { Request, Response } from "express";
import { Book } from "../models/book.js";
import { filterValidBooks } from "../validators/book.validator.js";

export const createBook = async (req: Request, res: Response) => {
  try {
    const {
      openLibraryKey,
      title,
      authors,
      coverId,
      firstPublishYear,
      subjects,
    } = req.body;

    if (!openLibraryKey || !title) {
      return res
        .status(400)
        .json({ message: "openLibraryKey and title are required" });
    }

    const existing = await Book.findOne({ openLibraryKey });
    if (existing) {
      return res.status(400).json({ message: "Book already exists" });
    }

    const book = new Book({
      openLibraryKey,
      title,
      authors,
      coverId,
      firstPublishYear,
      subjects,
    });
    await book.save();

    res.status(201).json(book);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error creating book", error: err?.message });
  }
};

export const getBooks = async (req: Request, res: Response) => {
  const { q, category } = req.query;

  try {
    let query = q as string;
    if (category) query = `${query} ${category}`;

    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1000&sort=editions`,
    );

    if (!response.ok) {
      return res.status(200).json([]);
    }

    const data = await response.json();
    const validBooks = filterValidBooks(data.docs);
    res.json(validBooks);
  } catch (error) {
    res.status(200).json([]);
  }
};

export const getBookDetail = async (req: Request, res: Response) => {
  let { key } = req.params;

  if (!key) {
    return res.status(400).json({ message: "Book key is required" });
  }

  try {
    let response = await fetch(`https://openlibrary.org/works/${key}.json`);
    let data = await response.json();

    if (data.type?.key === "/type/redirect" && data.location) {
      const newKey = data.location.replace("/works/", "");
      response = await fetch(`https://openlibrary.org/works/${newKey}.json`);
      data = await response.json();
    }

    const [editionsRes, ratingsRes] = await Promise.allSettled([
      fetch(`https://openlibrary.org/works/${key}/editions.json?limit=1`),
      fetch(`https://openlibrary.org/works/${key}/ratings.json`),
    ]);

    let pages: number | null = null;
    let firstPublishYear: number | null = null;
    let authors: string[] = [];

    if (editionsRes.status === "fulfilled" && editionsRes.value.ok) {
      const edData = await editionsRes.value.json();
      const firstEd = edData.entries?.[0];
      pages = firstEd?.number_of_pages ?? null;
      firstPublishYear = firstEd?.publish_date
        ? parseInt(firstEd.publish_date.match(/\d{4}/)?.[0] ?? "")
        : null;
    }

    let rating: number | null = null;
    let ratingCount: number | null = null;

    if (ratingsRes.status === "fulfilled" && ratingsRes.value.ok) {
      const rData = await ratingsRes.value.json();
      rating = rData.summary?.average
        ? Math.round(rData.summary.average * 10) / 10
        : null;
      ratingCount = rData.summary?.count ?? null;
    }

    if (data.authors?.length) {
      const authorFetches = data.authors.slice(0, 3).map((a: any) =>
        fetch(`https://openlibrary.org${a.author.key}.json`)
          .then((r) => r.json())
          .then((d) => d.name as string)
          .catch(() => null),
      );
      const results = await Promise.all(authorFetches);
      authors = results.filter(Boolean) as string[];
    }

    const rawSubjects: string[] = data.subjects ?? [];
    const subjects = rawSubjects
      .filter((s) => !s.includes(":") && s.length < 40)
      .slice(0, 10);

    const book = {
      key: data.key,
      title: data.title,
      authors,
      description:
        typeof data.description === "string"
          ? data.description
          : (data.description?.value ?? null),
      subjects,
      coverImage: data.covers?.length
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : null,
      firstPublishYear: data.first_publish_date
        ? parseInt(data.first_publish_date.match(/\d{4}/)?.[0] ?? "")
        : firstPublishYear,
      pages,
      rating,
      ratingCount,
    };

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Error getting book detail" });
  }
};
