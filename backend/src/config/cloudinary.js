import { v2 as cloudinary } from "cloudinary";

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (!isCloudinaryConfigured) {
  console.warn("WARNING: Cloudinary is not fully configured. Image uploads will fail.");
} else {
  console.log("Cloudinary configuration verified successfully.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;