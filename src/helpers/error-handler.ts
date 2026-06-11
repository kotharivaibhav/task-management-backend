import type { Request, Response, NextFunction } from "express";
class ErrorHandler {
  static notFound(req: Request, res: Response, next: NextFunction) {
    res.status(404).json({ message: "Resource not found" });
  }

  static serverError(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.error("Server error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export default ErrorHandler;