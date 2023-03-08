import { readdirSync, readdir } from "fs";
import path from "path";
import { Routes } from "./routes.interface";

const PATH_ROUTER = `${__dirname}`;

/**
 *
 * @returns
 */
const modules = Promise.all(
  readdirSync(PATH_ROUTER)
    .filter((fileName) => {
      if (!fileName.includes(".ts")) {
        return Boolean(
          readdirSync(path.join(PATH_ROUTER, fileName)).find(
            (files) => files === "index.ts"
          )
        );
      }
      return false;
    })
    .map(async (fileName) => {
      return import(`./${fileName}`).then((PathRoutes) => {
        return new PathRoutes.default() as Routes;
      });
    })
) as Promise<Routes[]>;

export default modules;
