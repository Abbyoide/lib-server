import { Request, Response } from "express";

export const getBooks = async (req: Request, res: Response) => {
  const { q } = req.query;

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=120`,
    );

    if (!response.ok) {
      return res.status(500).json({ message: "Error on the extern API" });
    }

    const data = await response.json();

    res.json(data.docs);
  } catch (error) {
    res.status(500).json({ message: "Error to get book" });
  }
};
