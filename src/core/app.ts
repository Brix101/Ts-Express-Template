import express from "express";
import { env } from "@/corelibs/Env";
import cors from "cors";
import hpp from "hpp";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { stream, logger } from "@/corelibs/Logger";
import errorMiddleware from "@/coremiddlewares/error.middleware";
import { Routes } from "@/modules/routes.interface";
import { print } from "@/corelibs/RegisteredRoutesLogger";
import { PrismaClient, User } from "@prisma/client";
import prisma from "@/corelibs/Prisma";
import { deserializeUser } from "./libs/DeserializeUser";

declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient | undefined;
      user: Partial<User> | undefined;
    }
  }
}

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = env.NODE_ENV || "development";
    this.port = env.PORT;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    // here you can start to work with your database
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} ========`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
      // Log all registerd routes
      logger.info(`======= REGISTERED ROUTES =======`);
      this.app._router.stack.forEach(print.bind(null, []));
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(env.LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: env.ORIGIN, credentials: true }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use((req, _, next) => {
      req.prisma = req.prisma || prisma;
      next();
    });
    this.app.use(deserializeUser);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/api/v1", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
