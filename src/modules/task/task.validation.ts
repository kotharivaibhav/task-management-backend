import { z } from 'zod';

export const taskCreateSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    assignedTo: z.string().min(1),
    priority: z.enum(["Low", "Medium", "High"]),
    status: z.enum(["Pending", "In Progress", "Completed"]),
    dueDate: z.coerce.date(),  
});
export type TaskCreateData = z.infer<typeof taskCreateSchema>;


export const taskStatusUpdateSchema = z.object({
    status: z.enum(["Pending", "In Progress", "Completed"]), 
});
export type TaskStatusUpdateSchema = z.infer<typeof taskStatusUpdateSchema>;

export const taskCommentSchema = z.object({
    comment: z.string().min(1),
});
export type TaskCommentSchema = z.infer<typeof taskCommentSchema>;

export const taskUpdateSchema = taskCreateSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required to update a task',
});
export type TaskUpdateData = z.infer<typeof taskUpdateSchema>;
