import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from '../src/components/TaskCard';
import { TaskStatus, type TaskItem } from '../src/types';
const mockOnStatusChange = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

beforeEach(() => {
  mockOnStatusChange.mockClear();
  mockOnEdit.mockClear();
  mockOnDelete.mockClear();
});

// Mock the child traffic light component
vi.mock('../src/components/TrafficLight', () => ({
  TrafficLight: ({ title }: { title: string }) => (
    <div data-testid="mock-traffic-light">{title}</div>
  ),
}));

describe('TaskCard Component', () => {
  const mockTask: TaskItem = {
    id: 'task-123',
    title: 'Review exchange Documents',
    description: 'Verify the contract terms before signing.',
    status: TaskStatus.pending,
    dueDate: new Date('2026-06-08T09:00:00Z'),
  };

  it('should render the task title, description, and status badge correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    // Verify key textual contents are outputted
    expect(
      screen.getByRole('heading', { level: 3, name: mockTask.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();
    expect(screen.getByText(mockTask.status)).toBeInTheDocument();
  });

  it('should render the traffic light when the status is pending or in-progress', () => {
    render(
      <TaskCard
        task={mockTask}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const trafficLight = screen.getByTestId('mock-traffic-light');
    expect(trafficLight).toBeInTheDocument();
  });

  it('should hide the TrafficLight component when status is completed or cancelled', () => {
    const closedTask = { ...mockTask, status: TaskStatus.completed };

    render(
      <TaskCard
        task={closedTask}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    // Traffic light should be omitted for resolved states
    expect(screen.queryByTestId('mock-traffic-light')).not.toBeInTheDocument();
  });

  it('should fire onStatusChange when a new status option is selected', () => {
    render(
      <TaskCard
        task={mockTask}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'completed' } });

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith('task-123', 'completed');
  });

  it('should fire the onEdit callback when clicking the Edit button', () => {
    render(
      <TaskCard
        task={mockTask}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should fire the onDelete callback when clicking the Delete button', () => {
    render(
      <TaskCard
        task={mockTask}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('task-123');
  });

  it('should disable the component', () => {
    render(
      <TaskCard
        task={mockTask}
        disabled={true}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    // Verify select element is locked out
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});
