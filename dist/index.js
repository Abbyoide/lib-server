import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use("/api/auth", authRoutes);
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map