import type { Request, Response, NextFunction } from "express";
import multer from "multer";

interface HttpError extends Error {
  status?: number;
}

const MULTER_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: "This file is too large. Please choose a smaller file and try again.",
  LIMIT_UNEXPECTED_FILE: "That file type isn't supported here. Please choose a different file.",
};

class ErrorHandlerMiddleware {
  handle = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof multer.MulterError) {
      const message = MULTER_MESSAGES[err.code] || "We couldn't upload this file. Please try again.";
      res.status(400).json({ message });
      return;
    }

    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
  };
}

export { ErrorHandlerMiddleware };
export const errorHandlerMiddleware = new ErrorHandlerMiddleware();
