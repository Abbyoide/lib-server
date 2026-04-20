import { Request, Response } from "express";
import { User } from "../models/user.js";
import { Book } from "../models/book.js";

const LOAN_LIMIT = 30;
const WISHLIST_LIMIT = 10;

async function upsertBook(bookData: {
  openLibraryKey: string;
  title: string;
  authors?: string[];
  coverId?: number;
  firstPublishYear?: number;
  subjects?: string[];
}) {
  const book = await Book.findOneAndUpdate(
    { openLibraryKey: bookData.openLibraryKey },
    { $set: bookData },
    { upsert: true, new: true },
  );
  return book;
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("borrowedBooks")
      .populate("wishlist");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};

export const loanBook = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.borrowedBooks.length >= LOAN_LIMIT) {
      return res
        .status(400)
        .json({ message: `Loan limit reached (${LOAN_LIMIT} books)` });
    }

    const book = await upsertBook({
      openLibraryKey,
      title,
      authors,
      coverId,
      firstPublishYear,
      subjects,
    });

    if (user.borrowedBooks.includes(book._id as any)) {
      return res.status(400).json({ message: "Book already loaned" });
    }

    user.borrowedBooks.push(book._id as any);
    await user.save();

    res.json({ message: "Book loaned successfully", book });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bookId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { borrowedBooks: bookId },
    });

    res.json({ message: "Book returned successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.length >= WISHLIST_LIMIT) {
      return res
        .status(400)
        .json({ message: `Wishlist limit reached (${WISHLIST_LIMIT} books)` });
    }

    const book = await upsertBook({
      openLibraryKey,
      title,
      authors,
      coverId,
      firstPublishYear,
      subjects,
    });

    if (user.wishlist.includes(book._id as any)) {
      return res.status(400).json({ message: "Book already in wishlist" });
    }

    user.wishlist.push(book._id as any);
    await user.save();

    res.json({ message: "Added to wishlist", book });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bookId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: bookId },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};
