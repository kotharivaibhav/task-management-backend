import type { Response, NextFunction } from "express";
import User from "../modules/user/user.model.ts";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "your_jwt_secret_key";
export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization required" });
    }

    let token = authHeader;
    token = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

    const verifytoken: any = jwt.verify(token, JWT_SECRET);
    const userId = verifytoken.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};