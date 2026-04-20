import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    openLibraryKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    authors: [{ type: String }],
    coverId: { type: Number },
    firstPublishYear: { type: Number },
    subjects: [{ type: String }],
  },
  { timestamps: true },
);

export const Book = mongoose.model("Book", bookSchema);
