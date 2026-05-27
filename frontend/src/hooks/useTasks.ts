import { useState, useCallback } from 'react';
import { taskService } from '../services/taskService';
import type { TaskItem, TaskPayload, TaskStatus } from '../types';

// Define an interface for the optional query filters matching the service
interface TaskFilters {
  status?: TaskStatus;
}

// Helper to retrieve the error
const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as any).response?.data;
    const errMessage = res?.errors?.[0]?.message || res?.message || fallback;
    return errMessage;
  }
  return fallback;
};

// Present the date as a proper Date object
const normalizeTask = (task: TaskItem): TaskItem => ({
  ...task,
  dueDate: new Date(task.dueDate),
});

export const useTasks = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = (await taskService.getAllTasks(filters)).map(normalizeTask);
      setTasks(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(
    async (taskData: TaskPayload): Promise<TaskItem> => {
      setError(null);
      try {
        const newTask = normalizeTask(await taskService.createTask(taskData));
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to create task'));
        throw err;
      }
    },
    [],
  );

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus): Promise<TaskItem> => {
      setError(null);
      try {
        const updatedTask = normalizeTask(
          await taskService.updateTaskStatus(id, status),
        );
        setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
        return updatedTask;
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to update task status'));
        throw err;
      }
    },
    [],
  );

  const updateTask = useCallback(
    async (id: string, taskData: TaskPayload): Promise<TaskItem> => {
      setError(null);
      try {
        const updatedTask = normalizeTask(
          await taskService.updateTask(id, taskData),
        );
        setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
        return updatedTask;
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to update task'));
        throw err;
      }
    },
    [],
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete task'));
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
  };
};
