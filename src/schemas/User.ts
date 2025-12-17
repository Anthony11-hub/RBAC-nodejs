import Joi from "joi";

export interface IUserDto {
  name: string;
  email: string;
  password: string;
}

export const loginSchema = Joi.object({
  email: Joi.string().min(1).required().messages({
    "string.empty": "email is required",
    "string.min": "email is required",
    "any.required": "email is required",
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "password is required",
    "string.min": "password is required",
    "any.required": "password is required",
  }),
});

export const registerSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.empty": "name is required",
    "string.min": "name is required",
    "any.required": "name is required",
  }),
  email: Joi.string().min(1).required().messages({
    "string.empty": "email is required",
    "string.min": "email is required",
    "any.required": "email is required",
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "password is required",
    "string.min": "password is required",
    "any.required": "password is required",
  }),
});
