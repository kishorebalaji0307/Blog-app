import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, description, author, image, taggedUsers } = req.body;

    const blog = await Blog.create({
      title,
      description,
      author,
      image,
      taggedUsers: taggedUsers || [],
    });

    if (taggedUsers && Array.isArray(taggedUsers) && taggedUsers.length > 0) {
      const notifications = taggedUsers.map((userId) => ({
        recipient: userId,
        sender: req.user?.id || author,
        blog: blog._id,
        type: "tag",
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Blogs (Pagination Added)
export const getBlogs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const blogs = await Blog.find()
      .populate("author")
      .populate("taggedUsers", "name email profileImage")
      .populate("comments.user", "name email profileImage")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: blogs.length,
      page,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Blog
export const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author")
      .populate("taggedUsers", "name email profileImage")
      .populate("comments.user", "name email profileImage");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check if user is the author of this blog
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this blog",
      });
    }

    const oldTagged = blog.taggedUsers ? blog.taggedUsers.map((id) => id.toString()) : [];
    const newTagged = req.body.taggedUsers || [];
    const newlyTagged = newTagged.filter((id) => !oldTagged.includes(id));

    // Update blog
    blog.title = req.body.title || blog.title;
    blog.description = req.body.description || blog.description;
    blog.image = req.body.image !== undefined ? req.body.image : blog.image;
    blog.taggedUsers = newTagged;
    await blog.save();

    // Trigger notifications for newly tagged users
    if (newlyTagged.length > 0) {
      const notifications = newlyTagged.map((userId) => ({
        recipient: userId,
        sender: req.user.id,
        blog: blog._id,
        type: "tag",
      }));
      await Notification.insertMany(notifications);
    }

    const populatedBlog = await Blog.findById(blog._id)
      .populate("author")
      .populate("taggedUsers", "name email profileImage")
      .populate("comments.user", "name email profileImage");

    res.status(200).json({
      success: true,
      blog: populatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check if user is the author of this blog
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this blog",
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like / Unlike Blog
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const userId = req.user.id;
    const isLiked = blog.likes.includes(userId);

    if (isLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      likes: blog.likes,
      message: isLiked ? "Blog unliked successfully" : "Blog liked successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save / Unsave Blog
export const saveBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isSaved = user.savedBlogs.includes(blogId);

    if (isSaved) {
      user.savedBlogs = user.savedBlogs.filter((id) => id.toString() !== blogId);
    } else {
      user.savedBlogs.push(blogId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      savedBlogs: user.savedBlogs,
      message: isSaved ? "Blog unsaved successfully" : "Blog saved successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Comment to Blog
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.comments.push({
      user: req.user.id,
      text,
    });

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("comments.user", "name email");

    res.status(201).json({
      success: true,
      comments: updatedBlog.comments,
      message: "Comment added successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Comment from Blog
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isCommenter = comment.user.toString() === req.user.id;
    const isBlogAuthor = blog.author.toString() === req.user.id;

    if (!isCommenter && !isBlogAuthor) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    blog.comments.pull(commentId);
    await blog.save();

    res.status(200).json({
      success: true,
      comments: blog.comments,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Blogs by User
export const getBlogsByUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.userId })
      .populate("author")
      .populate("taggedUsers", "name email profileImage")
      .populate("comments.user", "name email profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Blogs where User is Tagged
export const getBlogsByTaggedUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ taggedUsers: req.params.userId })
      .populate("author")
      .populate("taggedUsers", "name email profileImage")
      .populate("comments.user", "name email profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};