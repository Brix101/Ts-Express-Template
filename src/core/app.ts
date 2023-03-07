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

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = env.NODE_ENV || "development";
    this.port = env.PORT;

    this.initializeMiddlewares();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
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

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
