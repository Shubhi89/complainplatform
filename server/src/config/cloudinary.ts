import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configure Cloudinary with your keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Define the Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'complaint-platform-docs', // The folder name in your Cloudinary dashboard
      allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'], // Limit file types
      public_id: `doc-${Date.now()}`, // Unique filename
    };
  },
});

// 3. Export the upload middleware
export const upload = multer({ storage: storage });