
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext === ".csv" || ext === ".xlsx") cb(null, true);
  else cb(new Error("Format de fichier non supporté"), false);
};

const upload = multer({ storage, fileFilter });

export const uploadFile = upload.single("file");
