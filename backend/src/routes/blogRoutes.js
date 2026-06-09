import express from "express";

import {
  createBlog,
  getBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();


router.post("/", createBlog);

// Get All Blogs
router.get("/", getBlogs);

// Get Single Blog
router.get("/:id", getSingleBlog);

// Update Blog
router.put("/:id", updateBlog);

// Delete Blog
router.delete("/:id", deleteBlog);

export default router;