import { RequestHandler } from "express";
import { utils } from "../utils";
import { AppError } from "../error/app.error";

export const abilityMiddleware: RequestHandler = (req, _res, next) => {
  // Safety check: ensure user exists
  if (!req.user || !req.user.userId || !req.user.role) {
    throw new AppError("Authentication required", "Unauthorized", 401);
  }

  req.ability = utils.defineAbility({
    id: req.user.userId,
    role: req.user.role,
  });

  next();
};
