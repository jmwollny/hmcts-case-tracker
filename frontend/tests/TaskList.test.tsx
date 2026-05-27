import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../src/components/TaskList';
import { TaskStatus, type TaskItem } from '../src/types';

describe('TaskList Component', () => {
  const mockOnUpdate = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockTasks: TaskItem[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: TaskStatus.pending,
      dueDate: new Date('2026-06-15T14:00:00Z'),
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: TaskStatus.completed,
      dueDate: new Date('2026-06-20T14:00:00Z'),
    }
  ];

  beforeEach(() => {
    mockOnUpdate.mockClear()
    mockOnStatusChange.mockClear();
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('should display empty state when no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        onUpdate={mockOnUpdate}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('No tasks')).toBeInTheDocument();
  });

  it('should render all tasks', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onUpdate={mockOnUpdate}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
  });

  it('should call onStatusChange when status is changed', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onUpdate={mockOnUpdate}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
      />
    );
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'completed' } });
    
    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'completed');
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TaskList
        onUpdate={mockOnUpdate}
        tasks={mockTasks}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});
