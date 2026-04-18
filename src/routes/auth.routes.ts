import { Router } from "express";
import { testAuth } from "../controllers/auth.controller.js";

const router = Router();

router.get("/test", testAuth);

export default router;
