import type { IEmployee, IUser } from "./user.model.ts";
import UserRepository, { EmployeeRepository } from "./user.repository.ts";
import bcrypt from "bcrypt";
import type { UserRegistrationData } from "./user.validation.ts";
import jwt from "jsonwebtoken";

class UserService {
  private readonly userRepository: UserRepository;
  private readonly employeeRepository: EmployeeRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.employeeRepository = new EmployeeRepository();
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

      return this.userRepository.create(userData as IUser) as unknown as IUser;
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

  async login(data: { email: string; password: string }): Promise<IUser> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        throw new Error("User Not Found.");
      }

      await this.validatePassword(data.password, user.password);

      const token = this.generateToken(user);
      return { user, token } as unknown as IUser & { token: string };
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

      return  { ...userData, ...employeeData }; // Return combined user and employee data
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

  async getEmployeeByUserId(userId: string): Promise<IEmployee | null> {
    try {
      return this.employeeRepository.findByUserId(userId);
    } catch (error: unknown) {
      console.error("Error fetching employee by userId:", error);
      throw new Error(error as string);
    }
  }

  async updateEmployee(id: string, data: any): Promise<IEmployee | null> {
    try {
      const employee = await this.employeeRepository.findById(id) as unknown as IEmployee;
      if (!employee) {
        throw new Error("Employee not found");
      }

      const updateData = { ...data };
      if (updateData.joiningDate) {
        updateData.joiningDate = new Date(updateData.joiningDate);
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
