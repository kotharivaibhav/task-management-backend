import BaseRepository from "../../helpers/mongo/base.repository.ts";
import type { ITask } from "./task.model.ts";
import Task from "./task.model.ts";

class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(Task);
  }

  // create custom methods for task repository
  async findByTitle(title: string): Promise<ITask | null> {
    return Task.findOne({ title });
  } 

  async findByAssignedTo(userId: string): Promise<ITask[]> {
    return Task.find({ assignedTo: userId });
  }

}

export default TaskRepository;