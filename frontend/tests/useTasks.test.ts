import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from '../src/hooks/useTasks';
import { taskService } from '../src/services/taskService';
import type { TaskItem, TaskPayload } from '../src/types';
import { TaskStatus } from '../src/types';

// Mock the task service
vi.mock('../src/services/taskService', () => ({
  taskService: {
    getAllTasks: vi.fn(),
    createTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const mockTask = (overrides: Partial<TaskItem> = {}): TaskItem => ({
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: TaskStatus.pending,
  dueDate: new Date('2025-12-01T00:00:00.000Z'),
  ...overrides,
});

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  it('initialises with empty tasks, no loading, no error', () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // fetchTasks
  // ---------------------------------------------------------------------------

  describe('fetchTasks', () => {
    it('fetches tasks and converts dueDate strings to Date objects', async () => {
      const raw = mockTask();
      vi.mocked(taskService.getAllTasks).mockResolvedValue([raw]);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].dueDate).toBeInstanceOf(Date);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('passes filters through to the service', async () => {
      vi.mocked(taskService.getAllTasks).mockResolvedValue([]);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.fetchTasks({ status: TaskStatus.pending });
      });

      expect(taskService.getAllTasks).toHaveBeenCalledWith({
        status: 'pending',
      });
    });

    it('sets loading true during fetch, false after', async () => {
      let resolvePromise!: (value: TaskItem[]) => void;
      vi.mocked(taskService.getAllTasks).mockReturnValue(
        new Promise((res) => {
          resolvePromise = res;
        }),
      );

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.fetchTasks();
      });
      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise([]);
      });
      expect(result.current.loading).toBe(false);
    });

    it('sets error state on failure', async () => {
      vi.mocked(taskService.getAllTasks).mockRejectedValue({
        response: { data: { message: 'Server error' } },
      });

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(result.current.error).toBe('Server error');
      expect(result.current.loading).toBe(false);
    });

    it('falls back to default error message when response has no message', async () => {
      vi.mocked(taskService.getAllTasks).mockRejectedValue(
        new Error('Network error'),
      );

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(result.current.error).toBe('Failed to fetch tasks');
    });
  });

  // ---------------------------------------------------------------------------
  // createTask
  // ---------------------------------------------------------------------------

  describe('createTask', () => {
    it('prepends the new task to the list with dueDate as a Date', async () => {
      const existing = mockTask({ id: '1' });
      const created = mockTask({ id: '2', title: 'New Task' });

      vi.mocked(taskService.getAllTasks).mockResolvedValue([existing]);
      vi.mocked(taskService.createTask).mockResolvedValue(created);

      const { result } = renderHook(() => useTasks());

      // Seed initial state
      await act(async () => {
        await result.current.fetchTasks();
      });

      await act(async () => {
        await result.current.createTask({ title: 'New Task' } as TaskPayload);
      });

      expect(result.current.tasks[0].id).toBe('2');
      expect(result.current.tasks[0].dueDate).toBeInstanceOf(Date);
    });

    it('returns the new task', async () => {
      const created = mockTask({ id: '2' });
      vi.mocked(taskService.createTask).mockResolvedValue(created);

      const { result } = renderHook(() => useTasks());

      let returned!: TaskItem;
      await act(async () => {
        returned = await result.current.createTask({
          title: 'New Task',
        } as TaskPayload);
      });

      expect(returned.id).toBe('2');
      expect(returned.dueDate).toBeInstanceOf(Date);
    });

    it('sets error and rethrows on failure', async () => {
      const err = {
        response: { data: { errors: [{ message: 'Title required' }] } },
      };
      vi.mocked(taskService.createTask).mockRejectedValue(err);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await expect(
          result.current.createTask({} as TaskPayload),
        ).rejects.toEqual(err);
      });

      // Wait for the error state
      await waitFor(() => {
        expect(result.current.error).toBe('Title required');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // updateTaskStatus
  // ---------------------------------------------------------------------------

  describe('updateTaskStatus', () => {
    it('updates the matching task in place with dueDate as a Date', async () => {
      const initial = mockTask({ id: '1', status: TaskStatus.pending });
      const updated = mockTask({ id: '1', status: TaskStatus.completed });

      vi.mocked(taskService.getAllTasks).mockResolvedValue([initial]);
      vi.mocked(taskService.updateTaskStatus).mockResolvedValue(updated);

      const { result } = renderHook(() => useTasks());
      await act(async () => {
        await result.current.fetchTasks();
      });

      await act(async () => {
        await result.current.updateTaskStatus('1', TaskStatus.completed);
      });

      expect(result.current.tasks[0].status).toBe(TaskStatus.completed);
      expect(result.current.tasks[0].dueDate).toBeInstanceOf(Date);
    });

    it('sets error and rethrows on failure', async () => {
      const err = { response: { data: { message: 'Not found' } } };
      vi.mocked(taskService.updateTaskStatus).mockRejectedValue(err);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await expect(
          result.current.updateTaskStatus('1', TaskStatus.completed),
        ).rejects.toEqual(err);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Not found');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // updateTask
  // ---------------------------------------------------------------------------

  describe('updateTask', () => {
    it('replaces the matching task in the list', async () => {
      const initial = mockTask({ id: '1', title: 'Old title' });
      const updated = mockTask({ id: '1', title: 'New title' });

      vi.mocked(taskService.getAllTasks).mockResolvedValue([initial]);
      vi.mocked(taskService.updateTask).mockResolvedValue(updated);

      const { result } = renderHook(() => useTasks());
      await act(async () => {
        await result.current.fetchTasks();
      });

      await act(async () => {
        await result.current.updateTask('1', {
          title: 'New title',
        } as TaskPayload);
      });

      expect(result.current.tasks[0].title).toBe('New title');
      expect(result.current.tasks[0].dueDate).toBeInstanceOf(Date);
    });

    it('sets error and rethrows on failure', async () => {
      const err = { response: { data: { message: 'Forbidden' } } };
      vi.mocked(taskService.updateTask).mockRejectedValue(err);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await expect(
          result.current.updateTask('1', {} as TaskPayload),
        ).rejects.toEqual(err);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Forbidden');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // deleteTask
  // ---------------------------------------------------------------------------

  describe('deleteTask', () => {
    it('removes the task from the list', async () => {
      const task1 = mockTask({ id: '1' });
      const task2 = mockTask({ id: '2' });

      vi.mocked(taskService.getAllTasks).mockResolvedValue([task1, task2]);
      vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());
      await act(async () => {
        await result.current.fetchTasks();
      });

      await act(async () => {
        await result.current.deleteTask('1');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('2');
    });

    it('sets error and rethrows on failure', async () => {
      const err = { response: { data: { message: 'Not found' } } };
      vi.mocked(taskService.deleteTask).mockRejectedValue(err);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await expect(result.current.deleteTask('1')).rejects.toEqual(err);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Not found');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Error clearing
  // ---------------------------------------------------------------------------

  it('clears a previous error before each new operation', async () => {
    // First call fails
    vi.mocked(taskService.getAllTasks).mockRejectedValueOnce({
      response: { data: { message: 'Oops' } },
    });
    // Second call succeeds
    vi.mocked(taskService.getAllTasks).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await result.current.fetchTasks();
    });
    expect(result.current.error).toBe('Oops');

    await act(async () => {
      await result.current.fetchTasks();
    });
    expect(result.current.error).toBeNull();
  });
});
