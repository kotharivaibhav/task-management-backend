import type { IEmployee, IUser } from "./user.model.ts";
import UserRepository, { EmployeeRepository } from "./user.repository.ts";
import TaskRepository from "../task/task.repository.ts";
import bcrypt from "bcrypt";
import type { UpdateProfileData, UserRegistrationData } from "./user.validation.ts";
import jwt from "jsonwebtoken";
import { USER_ROLE } from "./user.contants.ts";

class UserService {
  private readonly userRepository: UserRepository;
  private readonly employeeRepository: EmployeeRepository;
  private readonly taskRepository: TaskRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.employeeRepository = new EmployeeRepository();
    this.taskRepository = new TaskRepository();
  }

  private sanitizeUser(user: IUser) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete (obj as { password?: string }).password;
    return obj;
  }

  /** Only Admin Create*/
  async create(data: UserRegistrationData): Promise<IUser> {
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "admin", // Default role, you can modify this as needed
      };

      const existingUser = await this.userRepository.findByEmail(
        userData.email,
      );
      if (existingUser) {
        throw new Error("Email already in use");
      }
      userData.password = await this.generateHash(userData.password);

      const user = await this.userRepository.create(userData as IUser) as unknown as IUser;
      return this.sanitizeUser(user) as unknown as IUser;
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  private async generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async validatePassword(password: string, hash: string) {
    const bCryptedPassword = await bcrypt.compare(password, hash);
    if (!bCryptedPassword) {
      throw new Error("Invalid Password.");
    }
    return true;
  }

  private generateToken(user: IUser): string {
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );
    return token;
  }

  async login(data: { email: string; password: string }): Promise<{ user: Record<string, unknown>; token: string }> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        throw new Error("User Not Found.");
      }

      await this.validatePassword(data.password, user.password);

      const token = this.generateToken(user);
      return { user: this.sanitizeUser(user), token };
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async createEmployee(data: any): Promise<any> {
    try {
      const userData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        role: "employee", // Default role for employees
      };

      const existingUser = await this.userRepository.findByEmail(
        userData.email,
      );
      if (existingUser) {
        throw new Error("Email already in use");
      }
      userData.password = await this.generateHash(data.password);
      
      const user = await this.userRepository.create(userData as IUser);
      const employeeData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        designation: data.designation,
        salary: data.salary,
        joiningDate: data.joiningDate,
        userId: user.id, // Link employee to the created user
      };

       await this.employeeRepository.create(employeeData as unknown as IEmployee); // Assuming you have a separate Employee model and repository

      const createdEmployee = await this.employeeRepository.findByUserId(String(user._id ?? user.id));
      return {
        ...this.sanitizeUser(user),
        ...(createdEmployee?.toObject?.() ?? createdEmployee ?? employeeData),
      };
    } catch (error: unknown) {
      console.error("Error creating employee:", error);
      throw new Error(error as string);
    }
  }

  async getEmployees(page: number, limit: number): Promise<IEmployee[]> {
    try {
      return this.employeeRepository.findAllPaginatedWithFilter({}, page, limit) as unknown as IEmployee[];
    } catch (error: unknown) {
      console.error("Error fetching employees:", error);
      throw new Error(error as string);
    }
  }

  async getEmployeeCount(filter: any = {}): Promise<number> {
    try {
      return this.employeeRepository.countDocuments(filter);
    } catch (error: unknown) {
      console.error("Error counting employees:", error);
      throw new Error(error as string);
    }
  }

  async getProfile(user: IUser) {
    const sanitized = this.sanitizeUser(user);
    if (user.role === USER_ROLE.EMPLOYEE) {
      const employee = await this.employeeRepository.findByUserId(String(user._id ?? user.id));
      return { user: sanitized, employee };
    }
    return { user: sanitized };
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = await this.userRepository.findById(userId) as unknown as IUser | null;
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: Partial<IUser> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && String(existing._id) !== String(userId)) {
        throw new Error("Email already in use");
      }
      updateData.email = data.email;
    }
    if (data.password) {
      updateData.password = await this.generateHash(data.password);
    }

    const updated = await this.userRepository.update(userId, updateData as IUser) as unknown as IUser;
    return { user: this.sanitizeUser(updated) };
  }

  async getDashboardStats(user: IUser) {
    const userId = String(user._id ?? user.id);
    const isAdmin = user.role === USER_ROLE.ADMIN;

    if (isAdmin) {
      const [totalEmployees, totalTasks, pending, inProgress, completed] = await Promise.all([
        this.employeeRepository.countDocuments({}),
        this.taskRepository.countDocuments({}),
        this.taskRepository.countDocuments({ status: "Pending" }),
        this.taskRepository.countDocuments({ status: "In Progress" }),
        this.taskRepository.countDocuments({ status: "Completed" }),
      ]);
      return {
        totalEmployees,
        totalTasks,
        tasksByStatus: { pending, inProgress, completed },
      };
    }

    const filter = { assignedTo: userId };
    const [totalTasks, pending, inProgress, completed] = await Promise.all([
      this.taskRepository.countDocuments(filter),
      this.taskRepository.countDocuments({ ...filter, status: "Pending" }),
      this.taskRepository.countDocuments({ ...filter, status: "In Progress" }),
      this.taskRepository.countDocuments({ ...filter, status: "Completed" }),
    ]);
    return {
      totalTasks,
      tasksByStatus: { pending, inProgress, completed },
    };
  }

  async getEmployeeByUserId(userId: string): Promise<IEmployee | null> {
    try {
      return this.employeeRepository.findByUserId(userId);
    } catch (error: unknown) {
      console.error("Error fetching employee by userId:", error);
      throw new Error(error as string);
    }
  }

  async updateEmployee(id: string, data: any, currentUser?: IUser): Promise<IEmployee | null> {
    try {
      const employee = await this.employeeRepository.findById(id) as unknown as IEmployee & { userId?: string };
      if (!employee) {
        throw new Error("Employee not found");
      }

      const updateData = { ...data };
      if (updateData.password) {
        const userId = String(employee.userId ?? "");
        if (userId) {
          const hashed = await this.generateHash(updateData.password);
          await this.userRepository.update(userId, { password: hashed } as IUser);
        }
        delete updateData.password;
      }
      if (updateData.joiningDate) {
        updateData.joiningDate = new Date(updateData.joiningDate);
      }

      if (updateData.firstName || updateData.lastName) {
        const userId = String(employee.userId ?? "");
        if (userId) {
          const name = `${updateData.firstName ?? employee.firstName} ${updateData.lastName ?? employee.lastName}`;
          await this.userRepository.update(userId, { name } as IUser);
        }
      }
      if (updateData.email) {
        const userId = String(employee.userId ?? "");
        if (userId) {
          await this.userRepository.update(userId, { email: updateData.email } as IUser);
        }
      }

      const updatedEmployee = await this.employeeRepository.update(id, updateData as unknown as IEmployee) as unknown as IEmployee;
      return updatedEmployee;
    } catch (error: unknown) {
      console.error("Error updating employee:", error);
      throw new Error(error as string);
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      const employee = await this.employeeRepository.findById(id) as unknown as IEmployee;
      if (!employee) {
        throw new Error("Employee not found");
      }

      await this.employeeRepository.delete(id);
    } catch (error: unknown) {
      console.error("Error deleting employee:", error);
      throw new Error(error as string);
    }
  }
  
}

export default UserService;
