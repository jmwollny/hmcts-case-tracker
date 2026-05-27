import axios from 'axios';
import type { TaskItem, TaskPayload, TaskStatus } from '../types';

const API_BASE_URL = '/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor with explicit types for error tracking
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * The task service
 */
export const taskService = {
  createTask: async (taskData: TaskPayload): Promise<TaskItem> => {
    const response = await api.post('/tasks', taskData);
    return response.data.data;
  },

  /**
   * Get a task by ud
   * @param id 
   * @returns The task
   */
  getTaskById: async (id: string): Promise<TaskItem> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  /**
   * Get a list of tasks
   * @param filters 
   * @returns The task list
   */
  getAllTasks: async (filters = {}): Promise<TaskItem[]> => {
    const response = await api.get('/tasks', { params: filters });
    return response.data.data;
  },

  /**
   * Update the status for a given task
   * @param id 
   * @param status 
   * @returns The updated task
   */
  updateTaskStatus: async (id: string, status: TaskStatus): Promise<TaskItem> => {
    const response = await api.patch(`/tasks/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  /**
   * Update a task
   * @param id 
   * @param taskData 
   * @returns The updated task
   */
  updateTask: async (id: string, taskData: TaskPayload): Promise<TaskItem> => {
    console.log(`BODE: ${JSON.stringify(taskData)}`)
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.data;
  },

  /**
   * Delete a task
   * @param id 
   */
  deleteTask: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  }
};

export default api;