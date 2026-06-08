import mongoose from "mongoose";
export interface ITask extends mongoose.Document {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  dueDate: Date;
  comments: {
    _id?: string;
    message: string;
    createdBy: string;
    createdAt: Date;
  }[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create a task schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    comments: [
      {
        message: {
          type: String,
          required: true,
        },
        createdBy: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model<ITask>("Task", taskSchema);
export default Task;
