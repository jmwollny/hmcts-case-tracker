import React from 'react';
import { useState, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import type { TaskItem, TaskPayload } from '../types';
import './TaskList.css';

interface TaskListProps {
  tasks: TaskItem[];
  onStatusChange: (id: string, status: TaskItem['status']) => void;
  onUpdate: (id: string, data: TaskPayload) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
  onEditChange: (isEditing: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onStatusChange,
  onUpdate,
  onDelete,
  disabled = false,
  onEditChange,
}) => {
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Sort by task due date ascending
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });
  }, [tasks]);

  // No tasks!!
  if (tasks.length === 0) {
    return <div className="empty-state">No tasks</div>;
  }

  /**
   * We are editing a task, notify parent
   * @param task 
   */
  const onEditTask = (task: TaskItem) => {
    setEditingTask(task);
    onEditChange(true);
  };

  /**
   * Close form and notify parent component
   */
  const handleCancelOrSubmit = () => {
    setEditingTask(null);
    onEditChange(false);
  };

  /**
   * When editing render the edit form otherwise the task card
   * @param task 
   * @returns 
   */
  const getFormOrCard = (task: TaskItem) => {
    if (editingTask && editingTask.id === task.id) {
      return (
        <div key={task.id} className="form-container">
          <TaskForm
            onSubmit={(payload: TaskPayload) => {
              onUpdate(task.id, payload);
              handleCancelOrSubmit();
            }}
            task={editingTask}
            onCancel={handleCancelOrSubmit}
          />
        </div>
      );
    }

    return (
      <TaskCard
        key={task.id}
        task={task}
        disabled={disabled || editingTask !== null}
        onStatusChange={onStatusChange}
        onEdit={onEditTask}
        onDelete={onDelete}
      />
    );
  };

  return (
    <div className="task-list">
      {sortedTasks.map((task) => getFormOrCard(task))}
    </div>
  );
};

export default TaskList;
