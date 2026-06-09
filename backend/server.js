import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();

// Set COOP Headers to allow Google Sign-In popups to communicate cleanly
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// CORS
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(express.json());

connectDB();

// Routes (supporting both /api prefix and non-prefix as fallback)
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/users", userRoutes);
app.use("/upload", uploadRoutes);
app.use("/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});