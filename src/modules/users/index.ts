import { Routes } from "@/coreinterfaces/routes.interface";
import { Argon } from "@/corelibs/Argon";
import { logger } from "@/corelibs/Logger";
import { exclude } from "@/corelibs/Prisma";
import requireUser from "@/coremiddlewares/requiredUser.middleware";
import { User } from "@prisma/client";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { processRequestBody } from "zod-express-middleware";
import { UpdateUserBody, updateUserSchema } from "./users.schema";

class UserRoutes implements Routes {
  public path = "/users";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
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

    this.router.put(
      `${this.path}`,
      [requireUser, processRequestBody(updateUserSchema.body)],
      async (req: Request<{}, {}, UpdateUserBody>, res: Response) => {
        try {
          const sessionUser = req.user;
          const { name, email, password } = req.body;
          if (sessionUser) {
            const updatedUser = await req.prisma?.user.update({
              where: {
                id: sessionUser.id,
              },
              data: {
                name: name || undefined,
                email: email || undefined,
                password: password ? await Argon.encrypt(password) : undefined,
              },
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
  }
}

export default UserRoutes;
