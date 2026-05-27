import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';
import { useTasks } from '../src/hooks/useTasks';
import { TaskStatus, type TaskItem } from '../src/types';

// 1. Mock the custom hook module completely
vi.mock('../src/hooks/useTasks');

describe('App Component Integration Tests', () => {
  // Setup sample mock data
  const TASK1_ID = '1';
  const TASK2_ID = '2';
  const TODAYS_DATE = new Date('2026-06-25T09:00:00Z');
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const TOMORROWS_DATE = new Date(TODAYS_DATE.getTime() + ONE_DAY_MS);
  const YESTERDAYS_DATE = new Date(TODAYS_DATE.getTime() - ONE_DAY_MS);

  // Define mocks
  const mockFetchTasks = vi.fn();
  const mockCreateTask = vi.fn();
  const mockUpdateTaskStatus = vi.fn();
  const mockUpdateTask = vi.fn();
  const mockDeleteTask = vi.fn();

  // Define tasks one complete and one pending
  const mockTasks: TaskItem[] = [
    {
      id: TASK1_ID,
      title: 'Pending Task 1',
      description: 'First description',
      status: TaskStatus.pending,
      dueDate: new Date(TOMORROWS_DATE),
    },
    {
      id: TASK2_ID,
      title: 'Completed Task 2',
      description: 'Second description',
      status: TaskStatus.completed,
      dueDate: new Date(YESTERDAYS_DATE),
    },
  ];

  const getEditFormDropDown = () => {
    // Locate the status select dropdown inside the Task Card
    // Using getAllByRole because there is a global filter drop down too
    const dropdowns = screen.getAllByRole('combobox');

    // Find the status drop down located in the edit form
    let statusDropDown = dropdowns.find((el) =>
      el.classList.contains('status-select'),
    );

    expect(
      statusDropDown,
      'Could not find the edit form status dropdown',
    ).toBeInTheDocument();
    return statusDropDown as HTMLSelectElement;
  };

  const getFilterDropDown = () => {
    const dropdowns = screen.getAllByRole('combobox');
    // Find the status drop down located in the edit form
    let filterDropDown = dropdowns.find((el) =>
      el.classList.contains('status-filter'),
    );
    expect(
      filterDropDown,
      'Could not find the filter dropdown',
    ).toBeInTheDocument();
    return filterDropDown as HTMLSelectElement;
  };

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['Date'],
    });

    // Today's date is 25th June
    vi.setSystemTime(TODAYS_DATE);
    vi.resetAllMocks();

    // Set up the useTasks hook, we are mocking the calls to the backend
    vi.mocked(useTasks).mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: mockFetchTasks,
      createTask: mockCreateTask,
      updateTaskStatus: mockUpdateTaskStatus,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the application', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'HMCTS Case Tracker' }),
    ).toBeInTheDocument();

    // Active tasks render on the main layout
    expect(screen.getByText('Pending Task 1')).toBeInTheDocument();

    // Completed tasks should be grouped into the collapsed Accordion section
    expect(
      screen.getByRole('button', { name: 'Completed' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Completed Task 2')).not.toBeInTheDocument(); // Accordion is closed by default
  });

  it('should indicate when the tasks are loading', () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks: [],
      loading: true,
      error: null,
      fetchTasks: mockFetchTasks,
      createTask: mockCreateTask,
      updateTaskStatus: mockUpdateTaskStatus,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
    });

    render(<App />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should display an error banner', () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks: [],
      loading: false,
      error: 'Failed to synchronize with HMCTS backend server.',
      fetchTasks: mockFetchTasks,
      createTask: mockCreateTask,
      updateTaskStatus: mockUpdateTaskStatus,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
    });

    render(<App />);
    expect(
      screen.getByText('Failed to synchronize with HMCTS backend server.'),
    ).toBeInTheDocument();
  });

  it('should submit the form', async () => {
    render(<App />);

    const NEW_TASK_TITLE = 'Task 3';
    const EXPECTED_DATE = TOMORROWS_DATE.toISOString().slice(0, 16);

    // Click "New Task" to show the new task form
    const newTaskButton = screen.getByRole('button', { name: 'New Task' });
    fireEvent.click(newTaskButton);

    // Fill the name and due date
    const titleInput = screen.getByRole('textbox', { name: 'Title *' });
    fireEvent.change(titleInput, { target: { value: NEW_TASK_TITLE } });
    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    fireEvent.change(dueDateInput, { target: { value: EXPECTED_DATE } });
    expect(dueDateInput.value).toBe(EXPECTED_DATE);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Task' });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledTimes(1);
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: NEW_TASK_TITLE }),
      );
    });
  });

  it('should prompt the user and invoke deleteTask when the Delete button is clicked', () => {
    // Spy on the window.confirm browser prompt layout
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true);

    render(<App />);

    // Find and click the Delete button belonging to Pending Task 1
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete this task?',
    );
    expect(mockDeleteTask).toHaveBeenCalledWith('1'); // Matches ID of Pending Task 1
  });

  it('should request refreshed data whenever the user filters by a specific status', () => {
    render(<App />);

    const filterDropdown = getFilterDropDown();

    // Change filter select to "Pending"
    fireEvent.change(filterDropdown, { target: { value: 'pending' } });

    // Verifies that useEffect responded to the filter update
    expect(mockFetchTasks).toHaveBeenCalledWith({ status: 'pending' });
  });

  it('should invoke handleStatusChange when the status dropdown is modified in the list', async () => {
    render(<App />);

    const statusDropdown = getEditFormDropDown();

    // Change the status from 'pending' to 'completed'
    fireEvent.change(statusDropdown!, { target: { value: 'completed' } });

    // Assert that the handler propagated data to updateTaskStatus properly
    await waitFor(() => {
      expect(mockUpdateTaskStatus).toHaveBeenCalledTimes(1);
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(TASK1_ID, 'completed');
    });
  });

  it('should render the completed tasks in a separate section', async () => {
    render(<App />);
    const filterDropdown = getFilterDropDown();

    // Default status is All - completed tasks are rendered in a separate expandable
    // section which is closed by default
    expect(mockFetchTasks).toHaveBeenCalledWith({});
    expect(
      screen.queryByRole('heading', { name: 'Filtered List' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Pending Task 1')).toBeInTheDocument();
    const completedSection = screen.getByRole('button', { name: 'Completed' });
    expect(completedSection).toBeInTheDocument();

    // Open the completed section
    fireEvent.click(completedSection);
    expect(screen.getByText('Completed Task 2')).toBeInTheDocument();

    // Filter by completed - the expandable section will be replaced by a list
    fireEvent.change(filterDropdown!, { target: { value: 'completed' } });
    expect(mockFetchTasks).toHaveBeenCalledWith({ status: 'completed' });
    expect(
      screen.getByRole('heading', { name: 'Filtered List' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Completed' }),
    ).not.toBeInTheDocument();
  });

  it('should invoke handleUpdateTask when saving an edited task', async () => {
    render(<App />);

    const NEW_TITLE = 'Pending Task 1 - edited';

    // Click the Edit button on the specific task card to enter its edit mode
    const editButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    // Get the title text box from the edit form
    const titleInput = screen.getByRole('textbox', {
      name: 'Title *',
    });
    fireEvent.change(titleInput, { target: { value: NEW_TITLE } });

    // Get the submit button
    const saveButton = screen.getByRole('button', {
      name: 'Update Task',
    });
    fireEvent.click(saveButton);

    // Verify handleUpdateTask caught the event and delegated to the hook
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledTimes(1);
      expect(mockUpdateTask).toHaveBeenCalledWith(
        TASK1_ID,
        expect.objectContaining({
          title: NEW_TITLE,
          status: 'pending',
        }),
      );
    });
  });

  it('should disable the completed task section when editing a task', async () => {
    render(<App />);

    // Click the Edit button on the specific task card to enter its edit mode
    const editButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    const completedSection = screen.getByRole('button', { name: 'Completed' });
    expect(completedSection).toBeInTheDocument();
    expect(completedSection).toHaveAttribute('aria-disabled', 'true');
  });

  it('should log an error if updateTaskStatus throws an exception', async () => {
    // Spy on console.error to keep the test runner output clean and trace calls
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Force the hook to throw an error when executed
    mockUpdateTaskStatus.mockRejectedValueOnce(new Error('Database Timeout'));

    render(<App />);

    const taskStatusDropdown = getEditFormDropDown();
    fireEvent.change(taskStatusDropdown, { target: { value: 'in-progress' } });

    // Verify the catch block executed successfully
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update task status:',
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });
});
