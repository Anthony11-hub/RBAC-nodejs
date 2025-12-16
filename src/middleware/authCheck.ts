import { RequestHandler } from "express";
import { AppError } from "../error/app.error";
import jwt from "jsonwebtoken";

const tokenSecret = process.env.JWT_SECRET;

if (!tokenSecret) {
  throw new AppError(
    "Internal server error",
    "JWT secret not defined in env variables",
    500,
  );
}

export const authCheck: RequestHandler = (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    throw new AppError("Unauthorized", "User not authorized", 401);
  }

  try {
    const decoded = jwt.verify(cookies.jwt, tokenSecret) as {
      userId: string;
    };

    if (!decoded.userId) {
      throw new AppError("Unauthorized", "Invalid or expired token.", 401);
    }

    req.user.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Unauthorized", "Invalid or expired token", 401);
    }

    throw new AppError(
      "Internal Server error",
      `An error occurred while checking privileges: ${error}`,
      500,
    );
  }
};
