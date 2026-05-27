import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '../src/services/taskService';
import api from '../src/services/taskService';
import { TaskStatus, type TaskItem, type TaskPayload } from '../src/types';

const postSpy = vi.spyOn(api, 'post');
const getSpy = vi.spyOn(api, 'get');
const putSpy = vi.spyOn(api, 'put');
const patchSpy = vi.spyOn(api, 'patch');
const deleteSpy = vi.spyOn(api, 'delete');

describe('taskService', () => {
  const mockTask: TaskItem = {
    id: '1',
    title: 'Task 1',
    description: 'Task 1 description',
    status: TaskStatus.pending,
    dueDate: new Date('2026-05-20T12:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createTask ', async () => {
    const mockPayload: TaskPayload = {
      title: 'Task 1',
      description: 'Task 1 description',
      status: TaskStatus.pending,
      dueDate: '2026-05-20T12:00:00.000Z',
    };

    const mockServerResponse = {
      data: {
        data: mockTask,
      },
    };

    postSpy.mockResolvedValueOnce(mockServerResponse as any);

    const result = await taskService.createTask(mockPayload);

    // Check it has beeb 'post'ed and unwrapped correctly
    expect(postSpy).toHaveBeenCalledWith('/tasks', mockPayload);
    expect(result).toEqual(mockTask);
  });

  it('getTaskById', async () => {
    const mockServerResponse = {
      data: {
        data: mockTask,
      },
    };

    getSpy.mockResolvedValueOnce(mockServerResponse as any);
    const result = await taskService.getTaskById('1');

    // Verify 'get' has been called and we have unpacked the result
    expect(getSpy).toHaveBeenCalledWith('/tasks/1');
    expect(result).toEqual(mockTask);
  });

  it('getAllTasks', async () => {
    const mockServerResponse = {
      data: {
        data: [mockTask],
      },
    };

    // Wire the mock resolution onto our live spy handler
    getSpy.mockResolvedValueOnce(mockServerResponse as any);

    const filters = { status: TaskStatus.pending };
    const result = await taskService.getAllTasks(filters);

    expect(getSpy).toHaveBeenCalledWith(
      '/tasks',
      expect.objectContaining({ params: filters }),
    );

    expect(result).toEqual([mockTask]);
  });

  it('updateTaskStatus', async () => {
    const mockServerResponse = {
      data: {
        data: { ...mockTask, status: TaskStatus.completed },
      },
    };
    patchSpy.mockResolvedValueOnce(mockServerResponse as any);

    const result = await taskService.updateTaskStatus(
      '1',
      TaskStatus.completed,
    );

    expect(patchSpy).toHaveBeenCalledWith('/tasks/1/status', {
      status: TaskStatus.completed,
    });
    expect(result.status).toBe(TaskStatus.completed);
  });

  it('updateTask', async () => {
    const mockPayload: TaskPayload = {
      title: 'Task 1 - updated',
      description: 'Task 1 description - updated',
      status: TaskStatus.pending,
      dueDate: '2026-05-20T12:00:00.000Z',
    };

    const mockServerResponse = {
      data: {
        data: { ...mockTask, title: 'Updated Case Title' },
      },
    };

    putSpy.mockResolvedValueOnce(mockServerResponse as any);

    const result = await taskService.updateTask('1', mockPayload);

    // Check the 'put' URL is valid and the result
    // is unpacked as expected
    expect(putSpy).toHaveBeenCalledWith('/tasks/1', mockPayload);
    expect(result.title).toBe('Updated Case Title');
  });

  it('deleteTask', async () => {
    deleteSpy.mockResolvedValueOnce({ status: 204 } as any);

    await taskService.deleteTask('1');

    // Verify it targets the absolute dynamic deletion endpoint perfectly
    expect(deleteSpy).toHaveBeenCalledWith('/tasks/1');
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('should trigger console.error and reject the Promise when the API intercepts a failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockAxiosError = {
      message: 'Network Error',
      response: {
        data: { message: 'Validation failed' },
      },
    };

    // The real interceptors are fully intact because we didn't wipe the file module out!
    const errorHandler = (api.interceptors.response as any).handlers[0]
      .rejected;

    await expect(errorHandler(mockAxiosError)).rejects.toEqual(mockAxiosError);

    expect(consoleSpy).toHaveBeenCalledWith(
      'API Error:',
      mockAxiosError.response.data,
    );

    consoleSpy.mockRestore();
  });
});
