import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Compounding index ensures a user cannot follow another twice.
// A index on following field ensures we can quickly load followers.
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });

const Follow = mongoose.model("Follow", followSchema);

export default Follow;
