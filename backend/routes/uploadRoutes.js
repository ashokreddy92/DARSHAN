const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private (ADMIN, ORGANIZER)
router.post('/', protect, authorize('ADMIN', 'ORGANIZER'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }

  // Upload to Cloudinary using upload_stream
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'darshanease' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: error.message });
      }

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        url: result.secure_url,
        public_id: result.public_id
      });
    }
  );

  // Send the file buffer to the write stream
  uploadStream.end(req.file.buffer);
});

module.exports = router;
