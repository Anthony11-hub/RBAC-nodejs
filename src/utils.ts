import { RequestHandler } from "express";
import { createLogger, transports, format } from "winston";
import { prisma } from "./config/db";
import { AppError } from "./error/app.error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Post, Comment, User, Role } from "./generated/prisma/client";
import { createPrismaAbility, PrismaQuery, Subjects } from "@casl/prisma";
import { AbilityBuilder, PureAbility } from "@casl/ability";

const tokenSecret = process.env.JWT_SECRET;

if (!tokenSecret) {
  throw new AppError("Internal Server Error", "No JWT Secret found", 500);
}

const logger = createLogger({
  transports: [
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.json(),
      ),
    }),
  ],
});

const generateSlug = async (value: string) => {
  const baseSlug = value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let slug = baseSlug;
  let counter = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

const tryCatchBlock =
  (controller: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

const healthCheck = async (): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: unknown) {
    const errorObj = e instanceof Error ? { e } : { err: String(e) };
    throw new AppError(
      "Internal server error",
      `Health check failed: ${errorObj}`,
      500,
    );
  }
};

const genSalt = (saltRounds: number, value: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return reject(err);
      bcrypt.hash(value, salt as string, (err, hash) => {
        if (err) return reject(err);
        resolve(hash as string);
      });
    });
  });
};

const genRefreshToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, tokenSecret, {
    expiresIn: "1h",
  });
};

const compareHash = (hash: string, value: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(value, hash, (err, result) => {
      if (err) return reject(err);
      resolve(result as true);
    });
  });
};

export type AppAbility = PureAbility<
  [
    string,
    (
      | Subjects<{
          Post: Post;
          Comment: Comment;
          User: User;
        }>
      | "all"
    ),
  ],
  PrismaQuery
>;

// abilities for all system users
const defineAbility = (user: { id: string; role: Role }) => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createPrismaAbility,
  );

  if (user.role === "ADMIN") {
    can("manage", "all");
  }

  if (user.role === "MODERATOR") {
    can("read", "Post");
    can("publish", "Post");
    can("hide", "Comment"); // moderator can hide comments
    cannot("delete", "User");
  }

  if (user.role === "AUTHOR") {
    can("read", "Post", { isPublished: true });
    can("read", "Post", { isPublished: false, authorId: user.id }); // can read own drafts
    can("create", "Post");
    cannot("publish", "Post"); // publishing is done by moderator

    // OWNERSHIP RULES
    can("update", "Post", { authorId: user.id }); // can update their post
    can("delete", "Post", { authorId: user.id }); // can delete their post

    can("create", "Comment");
    can("update", "Comment");
    can("read", "Comment", { isHidden: false }); // can't see hidden comments
  }

  return build();
};

export const utils = {
  logger,
  tryCatchBlock,
  healthCheck,
  genSalt,
  compareHash,
  genRefreshToken,
  defineAbility,
  generateSlug,
};
