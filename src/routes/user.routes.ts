import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getMe,
  loanBook,
  returnBook,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/user.controller.js";

const router = Router();

router.use(verifyToken);

router.get("/me", getMe);
router.post("/loans", loanBook);
router.delete("/loans/:bookId", returnBook);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:bookId", removeFromWishlist);

export default router;
