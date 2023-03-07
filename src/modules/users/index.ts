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
      res.send("hello post users");
    });
    this.router.get(`${this.path}`, (req, res) => {
      res.send("hello users");
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
