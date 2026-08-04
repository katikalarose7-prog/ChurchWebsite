import './loadEnv.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Factory so each resource type gets its own Cloudinary folder
const makeUploader = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `church-website/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (req, file, cb) => {
      // Check both MIME type AND file extension — the MIME type alone is
      // client-supplied metadata an attacker can freely spoof (e.g. naming a
      // script "photo.jpg" with a forged image/jpeg content-type), so
      // relying on it alone isn't a real security boundary by itself.
      const extOk = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname);
      const mimeOk = file.mimetype.startsWith('image/');
      if (extOk && mimeOk) cb(null, true);
      else cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed'), false);
    },
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }
};

export { cloudinary, makeUploader };
