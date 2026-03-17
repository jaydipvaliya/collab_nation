import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const storage = multer.memoryStorage();

const fileFilter = (allowed) => (req, file, cb) => {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Invalid file type. Allowed: ${allowed.join(', ')}`), false);
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['application/pdf']),
}).single('resume');

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
}).single('avatar');

export const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
}).single('logo');

// Upload buffer to Cloudinary
export const uploadToCloudinary = (folder, resourceType = 'auto') => async (req, res, next) => {
  if (!req.file) return next();
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `collab-nation/${folder}`, resource_type: resourceType },
        (err, result) => { if (err) reject(err); else resolve(result); }
      );
      Readable.from(req.file.buffer).pipe(uploadStream);
    });
    req.cloudinaryResult = result;
    next();
  } catch (err) {
    next(err);
  }
};
