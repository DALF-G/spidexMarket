const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => {
    return {
      folder: "spidex_categories", // folder name in Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 600, height: 600, crop: "limit" }],
    };
  },
});

// Multer instance
const upload = multer({ storage });

module.exports = upload;
