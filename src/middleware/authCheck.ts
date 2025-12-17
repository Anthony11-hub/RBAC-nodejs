import { RequestHandler } from "express";
import { AppError } from "../error/app.error";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/enums";

const tokenSecret = process.env.JWT_SECRET;

if (!tokenSecret) {
  throw new AppError(
    "Internal server error",
    "JWT secret not defined in env variables",
    500,
  );
}

export const authCheck: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AppError("No token provided", "Unauthorized", 401);
  }

  try {
    const decoded = jwt.verify(token, tokenSecret) as {
      userId: string;
      role: Role;
    };

    if (!decoded.userId) {
      throw new AppError("Unauthorized", "Invalid or expired token.", 401);
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
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
