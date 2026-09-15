import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "cv-" + uniqueSuffix + extension);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const isValidMimeType = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";
    const isValidExtension = path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error("Samo PDF fajlovi su dozvoljeni"), false);
    }
  },
});

export default upload;