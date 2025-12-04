import multer from "multer";
import path from "path";
import fs from "fs";


const uploadDir = path.join(__dirname, "../images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    if (file) {
      // Safer filename: Timestamp + Random Number + Extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    } 
  },
});

const photoUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      
      cb(null , false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 mb
  },
});

export default photoUpload;