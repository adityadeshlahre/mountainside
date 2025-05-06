import multer from "multer";
import path from "path";

const videoSaveDir = path.join(__dirname, "./../videos");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoSaveDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const updload = multer({ storage: storage });
