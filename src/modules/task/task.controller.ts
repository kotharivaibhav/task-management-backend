import TaskService from "./task.service.ts";
import type { Request, Response } from "express";

class TaskController {
  private readonly taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async create(req: any, res: Response) {
    try {
      const data = req.body;
      const task = await this.taskService.create({ createdBy: req.user?.id, ...data });

      res.status(201).json({
        message: "Task created successfully",
        data: task,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const total = await this.taskService.getAllCount();
      const tasks = await this.taskService.getAll(page, limit);
      res.status(200).json({
        message: "Tasks retrieved successfully",
        data: { tasks, page, limit, total },
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async assignedTask(req: any, res: Response) {
    try {
      const userId = req.user?.id as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const total = await this.taskService.getAssignedTasksCount(userId);
      const tasks = await this.taskService.getAssignedTasks(userId, page, limit);
      res.status(200).json({
        message: "Assigned tasks retrieved successfully",
        data: { tasks, page, limit, total },
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async updateTaskStatus(req: Request, res: Response) {
    try {
      const taskId = req.params.id as string;
      const { status } = req.body;

      await this.taskService.updateStatus(taskId, status, (req as any).user);
      res.status(200).json({
        message: "Task status updated successfully",
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const taskId = req.params.id as string;
      const data = req.body;
      const updatedTask = await this.taskService.updateTask(taskId, data, (req as any).user);
      res.status(200).json({
        message: "Task updated successfully",
        data: updatedTask,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const taskId = req.params.id as string;
      await this.taskService.deleteTask(taskId);
      res.status(200).json({
        message: "Task deleted successfully",
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async addComment(req: any, res: Response) {
    try {
      const taskId = req.params.id as string;
      const { comment } = req.body;
      await this.taskService.addComment(taskId, comment, req.user);
      res.status(200).json({
        message: "Comment added successfully",
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async updateComment(req: any, res: Response) {
    try {
      const taskId = req.params.id as string;
      const commentId = req.params.commentId as string;
      const { comment } = req.body;
      const updatedTask = await this.taskService.updateComment(taskId, commentId, comment, req.user);
      res.status(200).json({
        message: "Comment updated successfully",
        data: updatedTask,
        status: "success",
      });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }
}

export default TaskController;
