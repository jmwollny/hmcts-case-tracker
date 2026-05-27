import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from './Button';
import { StatusDropDown } from './StatusDropDown';
import './TaskForm.css';
import type { TaskItem, TaskPayload } from '../types';
import { TaskStatus } from '../types'; // omit the tyoe keyword so the enum is available at runtime

interface TaskFormProps {
  onSubmit: (task: TaskPayload) => void;
  task: TaskItem | null;
  onCancel: () => void;
}

// 2. Define standard form shape
interface FormDataState {
  title: string;
  description: string;
  status: TaskPayload['status'];
  dueDate: string;
}

// 3. Record type to handle noUncheckedIndexedAccess safely
type FormErrors = Record<keyof FormDataState, string | undefined>;

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  task = null,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormDataState>({
    title: '',
    description: '',
    status: TaskStatus.pending,
    dueDate: '',
  });

  // Initialize with an empty partial object casting to FormErrors
  const [errors, setErrors] = useState<Partial<FormErrors>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        dueDate: toLocalDateTimeString(task.dueDate)
      });
    }
  }, [task]);

  const toLocalDateTimeString = (date: Date): string => {
    const tzOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
    return localISOTime.slice(0, 16); // Captures 'YYYY-MM-DDTHH:mm'
  };

  // Handle elements change dynamically with standard HTML union types
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormDataState]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): Partial<FormErrors> => {
    const newErrors: Partial<FormErrors> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.dueDate === '') {
      newErrors.dueDate = 'Due date is required';
    }

    return newErrors;
  };

  const handleSubmit = (evt: { preventDefault: () => void }) => {
    evt.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      dueDate: new Date(formData.dueDate).toISOString()
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.pending,
      dueDate: '',
    });
    setErrors({});
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description (optional)"
          rows={4}
        />
      </div>
      <div className="form-row">
        {!task && (
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <StatusDropDown
              value={formData.status}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as TaskStatus,
                }))
              }
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
          {errors.dueDate && (
            <span className="error-message">{errors.dueDate}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <Button
          text={task ? 'Update Task' : 'Create Task'}
          colour="primary"
          type="submit"
        />
        <Button
          text="Cancel"
          colour="secondary"
          type="button"
          onClick={onCancel}
        />
      </div>
    </form>
  );
};

export default TaskForm;
