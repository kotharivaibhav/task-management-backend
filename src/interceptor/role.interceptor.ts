import type { Response, NextFunction } from "express";

export const checkAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "User is not admin" });
  }
  next();
};