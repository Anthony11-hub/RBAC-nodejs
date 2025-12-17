import Joi from "joi";

export interface IPostDto {
  title: string;
  content: string;
}

export const postSchema = Joi.object({
  title: Joi.string().min(1).required().messages({
    "string.empty": "title is required",
    "string.min": "title is required",
    "any.required": "title is required",
  }),
  content: Joi.string().min(10).required().messages({
    "string.empty": "content is required",
    "string.min": "content is required",
    "any.required": "content is required",
  }),
});

export interface IUpdatePostDto {
  id: string;
  title: string;
  content: string;
}

export const updatePostSchema = Joi.object({
  id: Joi.string().min(1).required().messages({
    "string.empty": "id is required",
    "string.min": "id is required",
    "any.required": "id is required",
  }),
  title: Joi.string().min(1).required().messages({
    "string.empty": "title is required",
    "string.min": "title is required",
    "any.required": "title is required",
  }),
  content: Joi.string().min(10).required().messages({
    "string.empty": "content is required",
    "string.min": "content is required",
    "any.required": "content is required",
  }),
});
