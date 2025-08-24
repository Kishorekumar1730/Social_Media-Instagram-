const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) =>
      "avatar_" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname),
  },
});

// Storage for post images/videos
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "webp"],
    public_id: (req, file) =>
      "post_" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname),
  },
});

// Multer upload configs
exports.uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

exports.uploadPost = multer({
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Delete file from Cloudinary
exports.deleteFile = async (fileUrl) => {
  try {
    // Cloudinary public_id is the last part of the URL without extension
    const parts = fileUrl.split("/");
    const fileWithExt = parts[parts.length - 1]; // e.g. avatar_xxx.png
    const publicId = `${parts[parts.length - 2]}/${fileWithExt.split(".")[0]}`;

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
