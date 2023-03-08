/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "./Env";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    payload: Partial<User>;
  }
}

export function generateJWT(payload: Partial<User>): string {
  return jwt.sign(
    {
      payload,
    },
    env.PRIVATE_KEY,
    { expiresIn: "1d", algorithm: "RS256" }
  );
}

export function verifyToken(token: string): Partial<User> | undefined {
  try {
    const { payload } = <jwt.JwtPayload>jwt.verify(token, env.PUBLIC_KEY);
    return payload;
  } catch (e: any) {
    return undefined;
  }
}
