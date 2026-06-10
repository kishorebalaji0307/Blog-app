import express from "express";

import {
  createBlog,
  getBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  saveBlog,
  addComment,
  deleteComment,
} from "../controllers/blogController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Blog (Requires Auth)
router.post("/", authMiddleware, createBlog);

// Get All Blogs
router.get("/", getBlogs);

// Get Single Blog
router.get("/:id", getSingleBlog);

// Update Blog (Requires Auth)
router.put("/:id", authMiddleware, updateBlog);

// Delete Blog (Requires Auth)
router.delete("/:id", authMiddleware, deleteBlog);

// Like/Unlike Blog (Requires Auth)
router.post("/:id/like", authMiddleware, likeBlog);

// Save/Unsave Blog (Requires Auth)
router.post("/:id/save", authMiddleware, saveBlog);

// Add Comment (Requires Auth)
router.post("/:id/comments", authMiddleware, addComment);

// Delete Comment (Requires Auth)
router.delete("/:id/comments/:commentId", authMiddleware, deleteComment);

export default router;