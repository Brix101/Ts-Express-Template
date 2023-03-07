import { Router } from "express";
import { Routes } from "../routes.interface";

class IndexRoutes implements Routes {
  public path = "/auth";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, (req, res) => {
      res.send("hello auth");
    });
  }
}

export default IndexRoutes;
