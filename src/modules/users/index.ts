import { logger } from "@/core/libs/Logger";
import { Router } from "express";
import { Routes } from "../routes.interface";

class IndexRoutes implements Routes {
  public path = "/users";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/register`, (req, res) => {
      try {
        res.send("hello register users");
      } catch (error) {
        logger.error(error);
      }
    });
    this.router.get(`${this.path}`, async (req, res) => {
      const users = await req.prisma?.user.findMany();

      console.log(users);
      res.send(users);
    });
    this.router.delete(`${this.path}/:id`, (req, res) => {
      res.send("hello post users");
    });
    this.router.put(`${this.path}/:id`, (req, res) => {
      res.send("hello users");
    });
  }
}

export default IndexRoutes;
