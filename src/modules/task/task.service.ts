import type { ITask } from "./task.model.ts";
import TaskRepository from "./task.repository.ts";

class TaskService {
  private readonly taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  /** Only Admin Create*/
  async create(data: any): Promise<ITask> {
    try {
      return this.taskRepository.create(data as ITask) as unknown as ITask;
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getAll(page = 1, limit = 10): Promise<ITask[]> {
    try {
      return this.taskRepository.findAllPaginatedWithFilter({}, page, limit) as unknown as ITask[];
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getAllCount(): Promise<number> {
    try {
      return this.taskRepository.countDocuments({});
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getAssignedTasks(userId: string, page = 1, limit = 10): Promise<ITask[]> {
    try {
      return this.taskRepository.findAllPaginatedWithFilter({ assignedTo: userId }, page, limit) as unknown as ITask[];
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async getAssignedTasksCount(userId: string): Promise<number> {
    try {
      return this.taskRepository.countDocuments({ assignedTo: userId });
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  private canAccessTask(task: ITask, user?: any): boolean {
    const userId = String(user?.id ?? user?._id ?? "");
    const isAdmin = user?.role === "admin";
    return isAdmin || task.assignedTo === userId;
  }

  async updateStatus(taskId: string, status: string, user?: any): Promise<void> {
    try {
      const task = (await this.taskRepository.findById(
        taskId,
      )) as unknown as ITask;
      if (!task) {
        throw new Error("Task not found");
      }

      if (!this.canAccessTask(task, user)) {
        throw new Error("Not authorized to update this task status");
      }

      await this.taskRepository.update(taskId, { status: status } as ITask);
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const task = (await this.taskRepository.findById(
        taskId,
      )) as unknown as ITask;
      if (!task) {
        throw new Error("Task not found");
      }

      await this.taskRepository.delete(taskId);
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async updateTask(taskId: string, data: any, user?: any): Promise<ITask> {
    try {
      const task = (await this.taskRepository.findById(taskId)) as unknown as ITask;
      if (!task) {
        throw new Error("Task not found");
      }

      // Permission: allow if admin or assigned user
      const userId = user?.id ?? user?._id ?? null;
      const isAdmin = user?.role === "admin";
      if (!isAdmin && userId && task.assignedTo !== String(userId)) {
        throw new Error("Not authorized to update this task");
      }

      const updateData = { ...data };
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updatedTask = (await this.taskRepository.update(taskId, updateData as ITask)) as unknown as ITask;
      return updatedTask;
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async addComment(
    taskId: string,
    comment: string,
    user: any,
  ): Promise<void> {
    try {
      const task = (await this.taskRepository.findById(
        taskId,
      )) as unknown as ITask;
      if (!task) {
        throw new Error("Task not found");
      }

      if (!this.canAccessTask(task, user)) {
        throw new Error("Not authorized to comment on this task");
      }

      const userId = String(user?.id ?? user?._id ?? "");
      const newComment = {
        message: comment,
        createdBy: userId,
        createdAt: new Date(),
      };
      task.comments.push(newComment);
      await this.taskRepository.update(taskId, task);
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }

  async updateComment(
    taskId: string,
    commentId: string,
    comment: string,
    user: any,
  ): Promise<ITask> {
    try {
      const task = (await this.taskRepository.findById(
        taskId,
      )) as unknown as ITask;
      if (!task) {
        throw new Error("Task not found");
      }

      const existingComment = task.comments.find((item) => item._id?.toString() === commentId)
      if (!existingComment) {
        throw new Error("Comment not found");
      }

      if (existingComment.createdBy !== user?.id && user?.role !== "admin") {
        throw new Error("Not authorized to edit this comment");
      }

      existingComment.message = comment
      const updatedTask = (await this.taskRepository.update(taskId, task)) as unknown as ITask;
      return updatedTask;
    } catch (error: unknown) {
      throw new Error(error as string);
    }
  }
}

export default TaskService;
