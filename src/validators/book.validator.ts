export interface OpenLibraryBookDoc {
  key: string;
  title: string;
  [key: string]: unknown;
}

export function isValidBook(book: unknown): book is OpenLibraryBookDoc {
  if (!book || typeof book !== "object") return false;
  
  const b = book as Partial<OpenLibraryBookDoc>;
  
  if (!b.key || typeof b.key !== "string") return false;
  if (!b.title || typeof b.title !== "string") return false;
  if (b.title.toLowerCase().includes("undefined")) return false;
  
  return true;
}

export function filterValidBooks(docs: unknown): OpenLibraryBookDoc[] {
  if (!Array.isArray(docs)) return [];
  return docs.filter(isValidBook);
}
