import { Router } from "express";
import UserController from "./user.controller.ts";
import { authenticate } from "../../interceptor/auth.interceptor.ts";
import { validateData } from "../../utilis/validation.ts";
import {
  createEmployeeSchema,
  fetchEmployeeSchema,
  userLoginSchema,
  userRegistrationSchema,
} from "./user.validation.ts";
import { checkAdmin } from "../../interceptor/role.interceptor.ts";

class UserRoute {
  private readonly userController: UserController;
  public readonly router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    /** admin create */
    this.router.post(
      "/users",
      // authenticate, // Uncomment this line if you want to require authentication for user creation
      validateData(userRegistrationSchema),
      this.userController.create.bind(this.userController),
    );

    /** user login */
    this.router.post(
      "/users/login",
      validateData(userLoginSchema),
      this.userController.login.bind(this.userController),
    );

    /** create employee */
    this.router.post(
      "/employees",
      authenticate,
      checkAdmin,
      validateData(createEmployeeSchema),
      this.userController.createEmployee.bind(this.userController),
    );

    /** view Employee */
    this.router.get(
      "/employees",
      authenticate,
      checkAdmin,
      validateData(fetchEmployeeSchema),
      this.userController.getEmployees.bind(this.userController),
    );

    /** update Employee */
    this.router.put(
      "/employees/:id",
      authenticate,
      validateData(createEmployeeSchema),
      this.userController.updateEmployee.bind(this.userController),
    );

    /** delete Employee */
    this.router.delete(
      "/employees/:id",
      authenticate,
      checkAdmin,
      this.userController.deleteEmployee.bind(this.userController),
    );
    
  }
}

export default new UserRoute().router;
