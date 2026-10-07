import multer from "multer";

class UploadMiddleware {
  static instance = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 200 * 1024 * 1024 },
  });
}

export { UploadMiddleware };
export const upload = UploadMiddleware.instance;
