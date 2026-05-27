import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusDropDown } from '../src/components/StatusDropDown';
import { TaskStatus } from '../src/types';

describe('StatusDropDown Component', () => {
  const mockOnChange = vi.fn();

  it('should render with task status options and the correct selected value', () => {
    render(
      <StatusDropDown 
        value={TaskStatus.pending} 
        onChange={mockOnChange} 
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe(TaskStatus.pending);

    // Extract and check the options inside the dropdown
    const options = screen.getAllByRole('option') as HTMLOptionElement[];
    
    // Total should match the number of enum keys in TaskStatus
    const enumLength = Object.values(TaskStatus).length;
    expect(options).toHaveLength(enumLength);

    // Verify a the label
    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument();
  });

  it('should toggle and include the "All Tasks" option when showAllOption is true', () => {
    render(
      <StatusDropDown 
        value="" 
        onChange={mockOnChange} 
        showAllOption={true} 
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('');

    // Get the first option in the list. It should be 'All tasks'
    const allOption = screen.getByRole('option', { name: 'All Tasks' }) as HTMLOptionElement;
    expect(allOption).toBeInTheDocument();
    expect(allOption.value).toBe('');
  });

  it('should select a new task status', () => {
    render(
      <StatusDropDown 
        value={TaskStatus.pending} 
        onChange={mockOnChange} 
      />
    );

    // Select the completed task status
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: TaskStatus.completed } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(TaskStatus.completed);
  });
});