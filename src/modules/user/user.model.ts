import mongoose from "mongoose";
export interface IUser extends mongoose.Document {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "employee";
  createdAt?: Date;
  updatedAt?: Date;
}

// Create a user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;

// Employee model
export interface IEmployee extends mongoose.Document {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create a employee schema
const employeeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);

