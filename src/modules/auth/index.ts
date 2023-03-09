import { Routes } from "@/coreinterfaces/routes.interface";
import { Argon } from "@/corelibs/Argon";
import { logger } from "@/corelibs/Logger";
import { exclude } from "@/corelibs/Prisma";
import { generateJWT } from "@/corelibs/Token";
import requireUser from "@/coremiddlewares/requiredUser.middleware";
import { Prisma, User } from "@prisma/client";
import { CookieOptions, Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { processRequestBody } from "zod-express-middleware";
import { SignInBody, SignUpBody, signUpSchema } from "./auth.schema";

class AuthRoutes implements Routes {
  public path = "/";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}signin`,
      async (req: Request<{}, {}, SignInBody>, res: Response) => {
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
            let options: CookieOptions = {
              maxAge: 1000 * 60 * 60 * 24, // would expire after 1 day
              httpOnly: true, // The cookie only accessible by the web server
            };

            res.cookie("Authorization", token, options);
            return res.status(StatusCodes.OK).json({ ...partialUser });
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
    this.router.post(
      `${this.path}signup`,
      processRequestBody(signUpSchema.body),
      async (req: Request<{}, {}, SignUpBody>, res: Response) => {
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
    this.router.post(
      `${this.path}logout`,
      requireUser,
      async (_: Request, res: Response) => {
        try {
          res.clearCookie("Authorization");
          res.status(StatusCodes.ACCEPTED).send();
        } catch (error) {
          logger.error(error);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Something went wrong" });
        }
      }
    );
    this.router.get(
      `${this.path}me`,
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

export default AuthRoutes;
