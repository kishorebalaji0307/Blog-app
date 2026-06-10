import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

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
    res.json({
      message: "Protected data accessed",
      user,
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
