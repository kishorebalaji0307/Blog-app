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

// CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(url => url.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173","https://blog-app-theta-silk-21.vercel.app","*"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, or direct server calls)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin);
      if (isAllowed || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

connectDB();

// Validate critical environment keys
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "secretkey123") {
  console.warn(
    "⚠️ WARNING: JWT_SECRET is missing or using the default simple key. Please configure a unique, secure JWT_SECRET in production environments."
  );
}

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
  console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
