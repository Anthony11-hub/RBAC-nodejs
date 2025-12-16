import { RequestHandler } from "express";
import { prisma } from "../config/db";
import { ValidationError } from "../error/validation.error";
import { postSchema, updatePostSchema } from "../schemas/Post";
import { accessibleBy } from "@casl/prisma";
import { AppError } from "../error/app.error";

export const createPost: RequestHandler = async (req, res) => {
  const body = req.body;

  const { error, value } = postSchema.validate(body, {
    abortEarly: false,
  });

  if (error) {
    throw new ValidationError("Validation failed", error.message);
  }

  const baseSlug = body.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-");

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      slug: baseSlug,
      authorId: req.user.userId as string,
    },
  });

  return res.status(201).json(post);
};

export const updatePost: RequestHandler = async (req, res) => {
  const body = req.body;

  const { error, value } = updatePostSchema.validate(body, {
    abortEarly: false,
  });

  if (error) {
    throw new ValidationError("Validation failed", error.message);
  }

  const post = await prisma.post.findFirst({
    where: {
      id: req.params.id,
      AND: accessibleBy(req.ability).Post,
    },
  });

  if (!post) {
    throw new AppError("Not found", "Not found", 403);
  }

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: req.body,
  });

  return res.status(201).json(updated);
};

export const hideComment: RequestHandler = async (req, res) => {
  if (!req.ability.can("hide", "Comment")) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  await prisma.comment.update({
    where: { id: req.params.id },
    data: { isHidden: true },
  });

  return res.status(201).json({ message: "Comment hidden" });
};

export const publishPost: RequestHandler = async (req, res) => {
  if (!req.ability.can("publish", "Post")) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  await prisma.post.update({
    where: { id: req.params.id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  return res.status(201).json({ message: "Post published" });
};
