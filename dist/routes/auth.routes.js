import { Router } from "express";
import { login, register, testAuth } from "../controllers/auth.controller.js";
const router = Router();
router.get("/test", testAuth);
router.post("/register", register);
router.post("/login", login);
export default router;
//# sourceMappingURL=auth.routes.js.map