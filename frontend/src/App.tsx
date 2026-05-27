import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Button from './components/Button';
import { useTasks } from './hooks/useTasks';
import { TaskStatus, type TaskItem, type TaskPayload } from './types';
import './App.css';
import { Accordian } from './components/Accordian';
import { StatusDropDown } from './components/StatusDropDown';

function App() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
  } = useTasks();
  const [isNewTask, setNewTask] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTasks(statusFilter ? { status: statusFilter } : {});
  }, [statusFilter]);

  const handleCreateTask = async (taskData: TaskPayload) => {
    try {
      await createTask(taskData);
      setNewTask(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    status: TaskItem['status'],
  ) => {
    try {
      await updateTaskStatus(taskId, status);
      fetchTasks(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleUpdateTask = async (id: string, taskData: TaskPayload) => {
    try {
      await updateTask(id, taskData);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleCancel = () => {
    setNewTask(false);
  };

  const handleFilterChange = (value: string) => {
    if (value === '') {
      setStatusFilter('');
      return;
    }
    setStatusFilter(value as TaskStatus);
  };

  const hasCompletedTasks = tasks.some(
    (task) => task.status === TaskStatus.completed,
  );

  const filterIsActive = () => statusFilter !== '';

  const renderSection = (
    title: string,
    defaultOpen: boolean,
    theFilter: (task: TaskItem) => boolean,
  ) => {
    return (
      <Accordian
        title={title}
        defaultOpen={defaultOpen}
        children={
          <TaskList
            tasks={tasks.filter(theFilter)}
            onStatusChange={handleStatusChange}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onEditChange={setIsEditing}
          />
        }
        disabled={isEditing || isNewTask}
      />
    );
  };

  /**
   * Render the full task list. Place the completed tasks in a separate collapsed section
   * @returns
   */
  const renderAllTasks = () => {
    return (
      <>
        <TaskList
          tasks={tasks.filter((t) => t.status !== TaskStatus.completed)}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          disabled={isNewTask}
          onEditChange={setIsEditing}
        />
        {hasCompletedTasks &&
          renderSection(
            'Completed',
            false,
            (t: TaskItem) => t.status === TaskStatus.completed,
          )}
      </>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>HMCTS Case Tracker</h1>
      </header>

      <main className="app-main">
        <div className="toolbar">
          <>
            <Button
              text={'New Task'}
              colour="primary"
              size="large"
              onClick={() => {
                setNewTask(true);
              }}
              disabled={isEditing || isNewTask}
            />

            <div className="filter-group">
              <label htmlFor="status-filter">Filter by Status:</label>
              <StatusDropDown
                value={statusFilter}
                onChange={handleFilterChange}
                showAllOption={true}
                disabled={isEditing || isNewTask}
              />
            </div>
          </>
        </div>

        {isNewTask && (
          <div className="form-container">
            <TaskForm
              onSubmit={handleCreateTask}
              task={null}
              onCancel={handleCancel}
            />
          </div>
        )}

        {error && (
          <div className="error-alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <p>Loading tasks...</p>
          </div>
        ) : (
          <>
            {filterIsActive() && (
              <>
                <h3>Filtered List</h3>
                <TaskList
                  tasks={tasks}
                  onStatusChange={handleStatusChange}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  disabled={isNewTask}
                  onEditChange={setIsEditing}
                />
              </>
            )}

            {filterIsActive() === false && renderAllTasks()}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
