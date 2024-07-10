const multer = require('multer');
const path = require('path');

// Storage
const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Upload
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileSize(file, cb);
  },
});

// Check file size
function checkFileSize(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb('Error: You can only upload image files');
  }
}

module.exports = upload;
