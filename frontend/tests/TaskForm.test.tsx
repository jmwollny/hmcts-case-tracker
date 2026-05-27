import { TaskStatus, type TaskItem } from '../src/types';
import { describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../src/components/TaskForm';

describe('TaskForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const TODAYS_DATE = new Date('2026-06-25T09:00:00Z');


  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['Date'],
    });
    // Today's date is 25th June
    vi.setSystemTime(TODAYS_DATE);
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });


  it('should render the form', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(
      screen.getByRole('heading', { name: 'Create New Task' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Title *' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Title *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Description' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Task description (optional)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'In-progress' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Completed' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Cancelled' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Task' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should update form fields on input change', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const titleInput = screen.getByPlaceholderText(
      'Task title',
    ) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    expect(titleInput.value).toBe('Test Task');
  });

  it('should show validation error for empty title', async () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  it('should show validation error for empty due date', async () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const submitButton = screen.getByText('Create Task');

    // Fill in the titles
    const titleInput = screen.getByPlaceholderText(
      'Task title',
    ) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText('Due date is required')).toBeInTheDocument();
  });

  it('should call onSubmit when form is valid', async () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByRole('textbox', { name: 'Title *' });
    fireEvent.change(titleInput, { target: { value: 'Valid Task' } });

    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    fireEvent.change(dueDateInput, { target: { value: '2026-06-25T14:40' } });
    expect(dueDateInput.value).toBe('2026-06-25T14:40');

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: '',
        dueDate: '2026-06-25T13:40:00.000Z',
        status: 'pending',
        title: 'Valid Task',
      });
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should pre-fill form with initial task data', () => {
    const initialTask: TaskItem = {
      id: '1',
      title: 'Existing Task',
      description: 'Task description',
      status: TaskStatus.in_progress,
      dueDate: new Date('2026-06-15T14:00:00Z'),
    };

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        task={initialTask}
      />,
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Task description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-06-15T15:00')).toBeInTheDocument();
  });
});
