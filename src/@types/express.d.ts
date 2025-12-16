import "express";
import { Role } from "../generated/prisma/enums";
import { AppAbility } from "../utils";

declare global {
  namespace Express {
    export interface Request {
      user: { userId?: string; role?: Role };
      token?: string;
      ability: AppAbility;
    }
  }
}
