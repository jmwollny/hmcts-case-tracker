import React from 'react';
import { TaskStatus, type TaskItem } from '../types';
import { Button } from './Button';
import { TrafficLight } from './TrafficLight';
import './TaskCard.css';

interface TaskCardProps {
  task: TaskItem;
  disabled?: boolean;
  onStatusChange: (id: string, status: TaskItem['status']) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  disabled = false,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: TaskStatus): string => {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.pending]: '#FFA500',
      [TaskStatus.in_progress]: '#0066CC',
      [TaskStatus.completed]: '#28a745',
      [TaskStatus.cancelled]: '#DC3545',
    };

    return colors[status] ?? '#999999';
  };

  const showOverdue = () => {
    return (
      task.status !== TaskStatus.completed &&
      task.status !== TaskStatus.cancelled
    );
  };

  return (
    <div className={`task-card ${disabled ? 'disabled' : ''}`}>
      <div className="task-header">
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status}
        </span>
        <div>{showOverdue() && <TrafficLight dueDate={task.dueDate} />}</div>
        {task.status === TaskStatus.completed && (
          <p className="task-date">Due date: {task.dueDate.toLocaleDateString()}</p>
        )}
      </div>

      <h3>{task.title}</h3>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-actions ">
        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange(task.id, e.target.value as TaskItem['status'])
          }
          className="status-select"
          disabled={disabled}
          aria-disabled={disabled}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {task.status !== TaskStatus.completed && (
          <Button
            text="Edit"
            colour="primary"
            onClick={() => onEdit(task)}
            disabled={disabled}
            aria-disabled={disabled}
          />
        )}
        <Button
          text="Delete"
          colour="danger"
          onClick={() => onDelete(task.id)}
          disabled={disabled}
          aria-disabled={disabled}
        />
      </div>
    </div>
  );
};

export default TaskCard;
