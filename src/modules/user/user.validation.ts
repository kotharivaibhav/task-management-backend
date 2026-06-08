import { z } from 'zod';

export const userRegistrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type UserLoginData = z.infer<typeof userLoginSchema>;

export const createEmployeeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  department: z.string(),
  designation: z.string(),
  salary: z.number().positive(),
  joiningDate: z.coerce.date(),
  password: z.string().min(8),
});
export type CreateEmployeeData = z.infer<typeof createEmployeeSchema>;

export const fetchEmployeeSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
});
export type FetchEmployeeData = z.infer<typeof fetchEmployeeSchema>;