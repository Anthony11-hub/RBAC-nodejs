import { RequestHandler } from "express";
import { AppError } from "../error/app.error";
import { ValidationError } from "../error/validation.error";
import { loginSchema, registerSchema } from "../schemas/User";
import { prisma } from "../config/db";
import { utils } from "../utils";

// register
export const registerController: RequestHandler = async (req, res, next) => {
  const body = req.body;

  const { error, value } = registerSchema.validate(body, {
    abortEarly: false,
  });

  if (error) {
    throw new ValidationError(error.message, error.message);
  }

  const hashedPassword = await utils.genSalt(10, body.password);

  // check if that user exists
  const userExists = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (userExists) {
    throw new AppError("User already exists", "user exists", 400);
  }

  // add to db
  try {
    await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });
  } catch (error: any) {
    throw new ValidationError(
      "Invalid input data provided.",
      error.details[0].message,
    );
  }

  return res.status(201).json({ message: "User registered successfully" });
};

// login
export const loginController: RequestHandler = async (req, res, next) => {
  const body = req.body;

  const { error, value } = loginSchema.validate(body, {
    abortEarly: false,
  });

  if (error) {
    throw new ValidationError(
      "Invalid email or password format",
      error.message,
    );
  }

  // authenticate user
  const user = await prisma.user.findUnique({
    where: { email: value.email },
  });

  if (!user) {
    throw new AppError(
      "User not found or unverified.", // User-facing message
      "Email does not match any user or the account is not verified.", // Internal message
      404,
    );
  }

  // password check
  if (!(await utils.compareHash(user.password, value.password))) {
    throw new AppError(
      "Wrong password.", // User-facing message
      "Password does not match stored hash.", // Internal message
      401,
    );
  }

  // generate refresh token
  const refreshToken = utils.genRefreshToken(user.id, user.role);

  res.status(200).json({
    message: "Logged in successfully",
    token: refreshToken, // for testing on postman
  });
};
