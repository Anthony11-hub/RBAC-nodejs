import { RequestHandler } from "express";
import { utils } from "../utils";

export const abilityMiddleware: RequestHandler = (req, _res, next) => {
  const user = req.user;

  req.ability = utils.defineAbility({
    id: user.userId ?? "",
    role: user.role ?? "AUTHOR",
  });

  next();
};
