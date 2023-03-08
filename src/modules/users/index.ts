import { Argon } from "@/core/libs/Argon";
import { logger } from "@/core/libs/Logger";
import { Router, Request, Response } from "express";
import { Routes } from "../routes.interface";
import { Prisma, User } from "@prisma/client";
import { RegisterUserBody, registerUserSchema } from "./users.schema";
import { StatusCodes } from "http-status-codes";
import { processRequestBody } from "zod-express-middleware";
import { exclude } from "@/core/libs/PrismaExclude";
import requireUser from "@/core/middlewares/requiredUser.middleware";

class IndexRoutes implements Routes {
  public path = "/users";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      processRequestBody(registerUserSchema.body),
      async (req: Request<{}, {}, RegisterUserBody>, res: Response) => {
        try {
          const { name, email, password } = req.body;
          const newUser = await req.prisma?.user.create({
            data: {
              name,
              email,
              password: await Argon.encrypt(password),
            },
          });

          const user = exclude<User, keyof User>(newUser as User, [
            "password",
            "deletedAt",
          ]);

          return res.status(StatusCodes.CREATED).json(user);
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
    this.router.get(
      `${this.path}`,
      requireUser,
      async (req: Request, res: Response) => {
        try {
          const users = await req.prisma?.user.findMany();
          res.send(users);
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
      requireUser,
      async (req: Request, res: Response) => {
        try {
          const sessionUser = req.user;
          if (sessionUser) {
            const deletedUser = await req.prisma?.user.update({
              where: {
                id: sessionUser.id,
              },
              data: {
                deletedAt: new Date(),
              },
            });

            const user = exclude<User, keyof User>(deletedUser as User, [
              "password",
            ]);

            return res.status(StatusCodes.OK).json(user);
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
    this.router.put(`${this.path}`, requireUser, async (req, res) => {
      try {
        const sessionUser = req.user;
        if (sessionUser) {
          const updatedUser = await req.prisma?.user.update({
            where: {
              id: sessionUser.id,
            },
            data: {},
          });
          const user = exclude<User, keyof User>(updatedUser as User, [
            "password",
            "deletedAt",
          ]);

          return res.status(StatusCodes.ACCEPTED).json(user);
        }
        return res.status(StatusCodes.FORBIDDEN).send();
      } catch (error) {
        logger.error(error);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Something went wrong" });
      }
    });
  }
}

export default IndexRoutes;
