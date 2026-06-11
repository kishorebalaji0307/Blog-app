import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Blog from "../models/Blog.js";

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-auth", googleAuth);

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ users: [] });
    }
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } }
          ]
        }
      ]
    })
    .select("name email profileImage")
    .limit(10);
    
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate({
        path: "savedBlogs",
        populate: {
          path: "author",
          select: "name email profileImage",
        },
      });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [followersCount, followingCount, postsCount] = await Promise.all([
      Follow.countDocuments({ following: req.user.id }),
      Follow.countDocuments({ follower: req.user.id }),
      Blog.countDocuments({ author: req.user.id })
    ]);

    res.json({
      message: "Protected data accessed",
      user: {
        ...user.toObject(),
        followersCount,
        followingCount,
        postsCount
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET profile details of any user
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const user = await User.findById(targetUserId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [followersCount, followingCount, postsCount, isFollowing] = await Promise.all([
      Follow.countDocuments({ following: targetUserId }),
      Follow.countDocuments({ follower: targetUserId }),
      Blog.countDocuments({ author: targetUserId }),
      Follow.exists({ follower: currentUserId, following: targetUserId })
    ]);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        followersCount,
        followingCount,
        postsCount,
        isFollowing: !!isFollowing
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow a user
router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = await Follow.findOne({ follower: currentUserId, following: targetUserId });
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    await Follow.create({ follower: currentUserId, following: targetUserId });

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: targetUserId }),
      Follow.countDocuments({ follower: currentUserId })
    ]);

    res.json({
      success: true,
      message: "Successfully followed user",
      followersCount,
      followingCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow a user
router.post("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const result = await Follow.findOneAndDelete({ follower: currentUserId, following: targetUserId });
    if (!result) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: targetUserId }),
      Follow.countDocuments({ follower: currentUserId })
    ]);

    res.json({
      success: true,
      message: "Successfully unfollowed user",
      followersCount,
      followingCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    await user.save();

    const updatedUser = await User.findById(req.user.id)
      .select("-password")
      .populate({
        path: "savedBlogs",
        populate: {
          path: "author",
          select: "name email profileImage",
        },
      });
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
