import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface TokenPayload {
  _id: string;
  role: string;
  iat: number;
  exp: number;
}

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    //  Decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    const user = await User.findById(decoded._id).select("-password");

    if (user) {
      req.user = user;
    }
  } catch (error) {
    console.error("Token verification failed:", error);
  }

  next();
};
