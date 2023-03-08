import { boolean, object, string, TypeOf } from "zod";

export const createPostSchema = {
  body: object({
    title: string({
      required_error: "name is required",
    }),
    content: string({
      required_error: "content is required",
    }),
    published: boolean().nullish(),
  }),
};

export const updatePostSchema = {
  body: object({
    id: string(),
    title: string().nullish(),
    content: string().nullish(),
    published: boolean().nullish().default(false),
  }),
};

export const deletePostSchema = {
  body: object({
    id: string(),
  }),
};

export type CreatePostBody = TypeOf<typeof createPostSchema.body>;
export type UpdatePostBody = TypeOf<typeof updatePostSchema.body>;
export type DeletePostBody = TypeOf<typeof deletePostSchema.body>;
