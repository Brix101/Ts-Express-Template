import { verifyToken } from "@/corelibs/Token";
import { NextFunction, Request, Response } from "express";
import { get } from "lodash";

export function deserializeUser(req: Request, _: Response, next: NextFunction) {
  const Authorization =
    req.cookies["Authorization"] ||
    (req.header("Authorization")
      ? get(req, "headers.authorization", "").replace(/^Bearer\s/, "")
      : null);

  //Todo emplement access & refresh token
  if (!Authorization) {
    return next();
  }

  const user = verifyToken(Authorization);

  if (user) {
    req.user = user;
  }

  return next();
}
