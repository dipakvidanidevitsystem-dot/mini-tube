import type { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
  status?: number;
}

class ErrorHandlerMiddleware {
  handle = (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal server error" });
  };
}

export { ErrorHandlerMiddleware };
export const errorHandlerMiddleware = new ErrorHandlerMiddleware();
