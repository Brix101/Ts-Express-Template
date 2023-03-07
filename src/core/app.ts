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
import { AppDataSource } from "@/corelibs/Database";
import { Routes } from "@/modules/routes.interface";

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
    AppDataSource.initialize()
      .then(() => {
        // here you can start to work with your database
        logger.info(`📦 Database initialized`);
        this.app.listen(this.port, () => {
          logger.info(`=================================`);
          logger.info(`======= ENV: ${this.env} =======`);
          logger.info(`🚀 App listening on the port ${this.port}`);
          logger.info(`=================================`);
        });
      })
      .catch((error) => logger.error(error));
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(env.LOG_FORMAT || "debug", { stream }));
    this.app.use(cors({ origin: env.ORIGIN, credentials: true }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
