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


router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
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
    const { name, bio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");
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
