import { Routes } from "@/core/interfaces/routes.interface";
import { exclude } from "@/core/libs/Prisma";
import { logger } from "@/corelibs/Logger";
import requireUser from "@/coremiddlewares/requiredUser.middleware";
import { Post, Prisma } from "@prisma/client";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { processRequestBody } from "zod-express-middleware";
import {
  CreatePostBody,
  createPostSchema,
  DeletePostBody,
  deletePostSchema,
  UpdatePostBody,
  updatePostSchema,
} from "./posts.schema";

class PostRoutes implements Routes {
  public path = "/posts";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      requireUser,
      async (
        req: Request<{}, {}, {}, { authorId?: string | null }>,
        res: Response
      ) => {
        const authorId = req.query.authorId;
        try {
          const posts = await req.prisma?.post.findMany({
            where: {
              authorId: authorId || undefined,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });
          res.send(posts);
        } catch (error) {
          logger.error(error);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Something went wrong" });
        }
      }
    );
    this.router.post(
      `${this.path}`,
      [requireUser, processRequestBody(createPostSchema.body)],
      async (req: Request<{}, {}, CreatePostBody>, res: Response) => {
        try {
          const sessionUser = req.user;
          const { title, content, published } = req.body;
          const newPost = await req.prisma?.post.create({
            data: {
              title,
              content,
              published: published || undefined,
              authorId: sessionUser?.id,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });

          const post = exclude<Post, keyof Post>(newPost as Post, [
            "authorId",
            "deletedAt",
          ]);

          return res.status(StatusCodes.CREATED).json(post);
        } catch (error) {
          logger.error(error);
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
              return res
                .status(StatusCodes.CONFLICT)
                .json({ message: "User using this email already exists" });
            }
          }
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Something went wrong" });
        }
      }
    );

    this.router.put(
      `${this.path}`,
      [requireUser, processRequestBody(updatePostSchema.body)],
      async (req: Request<{}, {}, UpdatePostBody>, res: Response) => {
        try {
          const { id, title, content, published } = req.body;
          const updatedPost = await req.prisma?.post.update({
            where: {
              id: id,
            },
            data: {
              title: title || undefined,
              content: content || undefined,
              published: published || undefined,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });

          return res.status(StatusCodes.ACCEPTED).json(updatedPost);
        } catch (error) {
          logger.error(error);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Something went wrong" });
        }
      }
    );

    this.router.delete(
      `${this.path}`,
      [requireUser, processRequestBody(deletePostSchema.body)],
      async (req: Request<{}, {}, DeletePostBody>, res: Response) => {
        try {
          const sessionUser = req.user;
          const postId = req.body.id;
          if (sessionUser) {
            await req.prisma?.post.update({
              where: {
                id: postId,
              },
              data: {
                deletedAt: new Date(),
              },
            });
            return res.status(StatusCodes.OK).send();
          }
          return res.status(StatusCodes.FORBIDDEN).send();
        } catch (error) {
          logger.error(error);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Something went wrong" });
        }
      }
    );
  }
}

export default PostRoutes;
