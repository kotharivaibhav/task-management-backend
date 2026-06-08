import { Router } from "express";
import { authenticate } from "../../interceptor/auth.interceptor.ts";
import { validateData } from "../../utilis/validation.ts";
import { taskCommentSchema, taskCreateSchema, taskStatusUpdateSchema, taskUpdateSchema } from "./task.validation.ts";
import TaskController from "./task.controller.ts";
import { checkAdmin } from "../../interceptor/role.interceptor.ts";

class TaskRoute {
  private readonly taskController: TaskController;
  public readonly router: Router;

  constructor() {
    this.taskController = new TaskController();
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    // Create Task
    this.router.post(
      "/tasks",
      authenticate,
      checkAdmin,
      validateData(taskCreateSchema),
      this.taskController.create.bind(this.taskController),
    );

    // get all tasks
    this.router.get(
      "/tasks",
      authenticate,
      checkAdmin,
      this.taskController.getAll.bind(this.taskController),
    );

    //view assign tasks
    this.router.get(
      "/tasks/assigned",
      authenticate,
      this.taskController.assignedTask.bind(this.taskController),
    );

    //update task status 
    this.router.patch(
      "/tasks/:id/status",
      authenticate,
      validateData(taskStatusUpdateSchema),
      this.taskController.updateTaskStatus.bind(this.taskController),
    );

    //update task
    this.router.put(
      "/tasks/:id",
      authenticate,
      validateData(taskUpdateSchema),
      this.taskController.updateTask.bind(this.taskController),
    );

    //delete task
    this.router.delete(
      "/tasks/:id",
      authenticate,
      checkAdmin,
      this.taskController.deleteTask.bind(this.taskController),
    );

    //add tasks comments
    this.router.post(
      "/tasks/:id/comments",
      authenticate,
      validateData(taskCommentSchema),
      this.taskController.addComment.bind(this.taskController),
    );

    // edit task comment
    this.router.patch(
      "/tasks/:id/comments/:commentId",
      authenticate,
      validateData(taskCommentSchema),
      this.taskController.updateComment.bind(this.taskController),
    );

  }
}

export default new TaskRoute().router;
