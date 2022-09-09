import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// checks ig jwt token is real and grants access to user
export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json("You are not signed in");

  jwt.verify(
    token,
    process.env.JWT_TOKEN || "changeMe",
    (err: any, decoded: any) => {
      if (err)
        return res.status(401).json("Invalid credentials, please log in again");
      req.user = decoded;
      next();
    }
  );
}
