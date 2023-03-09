import { Router } from "express";

// Todo move this interface
export interface Routes {
  path?: string;
  router: Router;
}
