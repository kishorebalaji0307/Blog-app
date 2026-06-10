import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
export const uploadImage = async (req, res) => {
  // console.log("BODY =>", req.body);
  // console.log("FILE =>", req.file); 
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "blog-images",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      });

    const result = await uploadToCloudinary();

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
    });
  }  catch (error) {
  console.log("UPLOAD ERROR =>", error);

  res.status(500).json({
    success: false,
    message: error.message,
  });
  }
};