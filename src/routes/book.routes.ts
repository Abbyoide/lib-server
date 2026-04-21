import { Router } from "express";
import {
  getBooks,
  getBookDetail,
  createBook,
} from "../controllers/book.controller.js";

const router = Router();

router.get("/search", getBooks);
router.get("/:key", getBookDetail);
router.post("/", createBook);

export default router;
