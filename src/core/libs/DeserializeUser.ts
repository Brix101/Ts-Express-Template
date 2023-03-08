import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import { verifyToken } from "./Token";

export function deserializeUser(req: Request, _: Response, next: NextFunction) {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );
  //Todo emplement access & refresh token
  if (!accessToken) {
    return next();
  }

  const user = verifyToken(accessToken);

  if (user) {
    req.user = user;
  }

  return next();
}
