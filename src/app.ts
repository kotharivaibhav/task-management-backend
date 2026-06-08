import express from "express";
import type { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import ErrorHandler from "./helpers/error-handler.ts";
import userRoutes from "./modules/user/user.routes.ts";
import Database from "./connection/mongo.ts";
import taskRoutes from "./modules/task/task.routes.ts";

class App {
  private readonly app: Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "3000");
    this.init();
  }

  private init() {
    this.initMiddlewares();
    this.initConfig();
    this.initRoutes();
    this.initErrorHandling();
  }

  private initConfig() {
    new Database();
  }

  private initMiddlewares() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    dotenv.config();
  }

  private initRoutes() {
    this.app.use("/api/v1", userRoutes);
    this.app.use("/api/v1", taskRoutes);
  }

  private initErrorHandling() {
    this.app.use(ErrorHandler.notFound);
    this.app.use(ErrorHandler.serverError);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}

export default App;