import { RequestHandler } from "express";
import { prisma } from "../config/db";
import { ValidationError } from "../error/validation.error";
import { postSchema, updatePostSchema } from "../schemas/Post";
import { accessibleBy } from "@casl/prisma";
import { AppError } from "../error/app.error";
import { subject } from "@casl/ability";
import { utils } from "../utils";

export const listPosts: RequestHandler = async (req, res) => {
  const posts = await prisma.post.findMany({
    where: accessibleBy(req.ability).Post,
  });

  return res.status(200).json(posts);
};

export const getPost: RequestHandler = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: {
      id: req.params.id,
      AND: accessibleBy(req.ability).Post,
    },
  });

  if (!post) {
    throw new AppError("Post not found", "Post not found", 404);
  }

  return res.status(200).json(post);
};

export const createPost: RequestHandler = async (req, res) => {
  const body = req.body;

  if (!req.ability.can("create", "Post")) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  const { error, value } = postSchema.validate(body, {
    abortEarly: false,
  });

  if (error) {
    throw new ValidationError(error.message, error.message);
  }

  const slug = await utils.generateSlug(value.title);

  const post = await prisma.post.create({
    data: {
      title: value.title,
      content: value.content,
      slug,
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
    throw new ValidationError(error.message, error.message);
  }

  const post = await prisma.post.findFirst({
    where: {
      id: req.params.id,
    },
  });

  if (!post) {
    throw new AppError("Post not found", "Not found", 404);
  }

  if (!req.ability.can("update", subject("Post", post))) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: {
      title: value.title,
      content: value.content,
    },
  });

  return res.status(201).json(updated);
};

export const deletePost: RequestHandler = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
  });

  if (!post) {
    throw new AppError("Post not found", "Not found", 404);
  }

  if (!req.ability.can("delete", subject("Post", post))) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  await prisma.post.delete({
    where: { id: post.id },
  });

  return res.status(201).json({ message: "Post deleted" });
};

export const hideComment: RequestHandler = async (req, res) => {
  const comment = await prisma.comment.findUnique({
    where: { id: req.params.id },
  });

  if (!comment) {
    throw new AppError("Comment not found", "Not found", 404);
  }

  if (!req.ability.can("hide", subject("Comment", comment))) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  await prisma.comment.update({
    where: { id: comment.id },
    data: { isHidden: true },
  });

  return res.status(201).json({ message: "Comment hidden" });
};

export const publishPost: RequestHandler = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
  });

  if (!post) {
    throw new AppError("Post not found", "Not found", 404);
  }

  if (!req.ability.can("publish", subject("Post", post))) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  await prisma.post.update({
    where: { id: post.id },
    data: {
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  return res.status(201).json({ message: "Post published" });
};
