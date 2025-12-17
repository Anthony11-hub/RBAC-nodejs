import { RequestHandler } from "express";
import { AppError } from "../error/app.error";
import { ValidationError } from "../error/validation.error";
import { prisma } from "../config/db";
import { subject } from "@casl/ability";

export const updateUserRole: RequestHandler = async (req, res) => {
  const { role } = req.body;

  if (!role) {
    throw new ValidationError("Role not provided", "Role not provided");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!user) {
    throw new AppError("User not found", "User not found", 404);
  }

  if (!req.ability.can("update", subject("User", user))) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  await prisma.user.update({
    where: { id: req.params.id },
    data: {
      role,
    },
  });

  return res.status(201).json({ message: "User updated successfully" });
};

export const deleteUser: RequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) {
    throw new AppError("User not found", "User not found", 404);
  }

  if (!req.ability.can("delete", subject("User", user))) {
    throw new AppError("Forbidden", "Forbidden", 403);
  }

  await prisma.user.delete({
    where: { id: req.params.id },
  });

  return res.status(201).json({ message: "User deleted successfully" });
};
