import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 8080;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
