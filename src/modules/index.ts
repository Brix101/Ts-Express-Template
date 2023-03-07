import { readdirSync } from "fs";
import { Routes } from "./routes.interface";

const PATH_ROUTER = `${__dirname}`;

/**
 *
 * @returns
 */
const modules = Promise.all(
  readdirSync(PATH_ROUTER)
    .map((fileName) => {
      if (!fileName.includes(".ts")) {
        return import(`./${fileName}`).then((PathRoutes) => {
          return new PathRoutes.default() as Routes;
        });
      }
    })
    .filter(Boolean)
);

export default modules;
