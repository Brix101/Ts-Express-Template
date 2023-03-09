import { Routes } from "@/coreinterfaces/routes.interface";
import { deserializeUser } from "@/corelibs/DeserializeUser";
import { env } from "@/corelibs/Env";
import { logger, stream } from "@/corelibs/Logger";
import prisma from "@/corelibs/Prisma";
import { print } from "@/corelibs/RegisteredRoutesLogger";
import errorMiddleware from "@/coremiddlewares/error.middleware";
import { PrismaClient, User } from "@prisma/client";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

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
