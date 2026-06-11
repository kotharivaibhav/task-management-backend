import type { Request, Response } from "express";
import UserService from "./user.service.ts";
import type { IUser } from "./user.model.ts";
import type {
  CreateEmployeeData,
  UserLoginData,
  UserRegistrationData,
} from "./user.validation.ts";
import { USER_ROLE } from "./user.contants.ts";

class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async create(req: Request, res: Response) {
    try {
      const data: UserRegistrationData = req.body;
      const user = await this.userService.create(data);
      res.status(201).json({
        message: "User created successfully",
        data: user,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const user = await this.userService.login(req.body as UserLoginData);
      res
        .status(200)
        .json({ message: "Login successful", data: user, status: "success" });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async createEmployee(req: Request, res: Response) {
    try {
      const data: CreateEmployeeData = req.body;

      const user = await this.userService.createEmployee(data);

      res.status(201).json({
        message: "Employee created successfully",
        data: user,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getProfile(req: any, res: Response) {
    try {
      const profile = await this.userService.getProfile(req.user);
      res.status(200).json({
        message: "Profile retrieved successfully",
        data: profile,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async updateProfile(req: any, res: Response) {
    try {
      const updated = await this.userService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        message: "Profile updated successfully",
        data: updated,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getDashboardStats(req: any, res: Response) {
    try {
      const stats = await this.userService.getDashboardStats(req.user);
      res.status(200).json({
        message: "Dashboard stats retrieved successfully",
        data: stats,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getEmployees(req: Request, res: Response) {
    try {
      const query = (req as Request & { validatedQuery?: { page?: number; limit?: number } }).validatedQuery;
      const page = query?.page ?? (parseInt(req.query.page as string) || 1);
      const limit = query?.limit ?? (parseInt(req.query.limit as string) || 10);
      const userCount = await this.userService.getEmployeeCount();
      const employees = await this.userService.getEmployees(
        page,
        limit,
      );
      res.status(200).json({
        message: "Employees retrieved successfully",
        data: { employees, page, limit, total: userCount },
        status: "success",
      });
    } catch (error: unknown) {
      console.error("Error fetching employees:", error);
      throw new Error(error as string);
    }
  }


  async updateEmployee(req: any, res: Response) {
    try {
      let employeeId = req.params.id;
      if (req?.user?.role !== USER_ROLE.ADMIN) {
        const employee = await this.userService.getEmployeeByUserId(req.user.id as string);
        if (!employee) {
          throw new Error("Employee record not found for the authenticated user");
        }
        employeeId = employee.id ?? employee._id.toString();
      }

      const data = req.body;

      const updatedEmployee = await this.userService.updateEmployee(employeeId, data, req.user);
      res.status(200).json({
        message: "Employee updated successfully",
        data: updatedEmployee,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }


  async deleteEmployee(req: any, res: Response) {
    try {
      const employeeId = req.params.id;
      await this.userService.deleteEmployee(employeeId);
      res.status(200).json({
        message: "Employee deleted successfully",
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }
}

export default UserController;
