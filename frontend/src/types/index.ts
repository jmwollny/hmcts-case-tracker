export interface IItem {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface TaskPayload extends IItem {
  dueDate: string;
}

export interface TaskItem extends IItem   {
  id: string;
  dueDate: Date
}

export enum TaskStatus {
  pending = 'pending',
  in_progress = 'in-progress',
  completed = 'completed',
  cancelled = 'cancelled',
}
