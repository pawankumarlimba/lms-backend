import multer from "multer";
import { BadRequestError } from "@core/errors/ApiError";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB, per spec
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const storage = multer.memoryStorage();

export const salarySlipUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(new BadRequestError("Only PDF, JPG and PNG files are allowed"));
    }
    callback(null, true);
  },
}).single("salarySlip");
