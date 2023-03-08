import { Argon } from "@/core/libs/Argon";
import { logger } from "@/core/libs/Logger";
import { exclude } from "@/core/libs/PrismaExclude";
import { generateJWT } from "@/core/libs/Token";
import requireUser from "@/core/middlewares/requiredUser.middleware";
import { User } from "@prisma/client";
import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Routes } from "../routes.interface";
import { LoginBody } from "./auth.schema";

class IndexRoutes implements Routes {
  public path = "/auth";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/login`,
      async (req: Request<{}, {}, LoginBody>, res: Response) => {
        try {
          const { email, password } = req.body;
          const user = await req.prisma?.user.findUnique({
            where: {
              email,
            },
          });

          if (user) {
            const passwordCorrect = await Argon.compare(
              password,
              user.password
            );
            if (!passwordCorrect) {
              return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ msg: "Incorrect email or password" });
            }

            const partialUser = exclude<User, keyof User>(user as User, [
              "password",
              "deletedAt",
              "createdAt",
              "updatedAt",
            ]);

            const token = generateJWT(partialUser);

            return res
              .status(StatusCodes.OK)
              .json({ ...partialUser, token: token });
          } else {
            return res
              .status(StatusCodes.NOT_FOUND)
              .json({ msg: "User not found" });
          }
        } catch (error) {
          logger.error(error);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Something went wrong" });
        }
      }
    );
    this.router.get(
      `${this.path}/user`,
      requireUser,
      async (req: Request, res: Response) => {
        try {
          const user = req.user;
          res.send(user);
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

export default IndexRoutes;
