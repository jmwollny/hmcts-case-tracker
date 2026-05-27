import React from 'react';
import { TaskStatus } from '../types';

interface StatusDropDownProps {
  value: string;
  onChange: (value: string) => void;
  showAllOption?: boolean;
  disabled?: boolean;
}

export const StatusDropDown: React.FC<StatusDropDownProps> = ({
  value,
  onChange,
  showAllOption = false,
  disabled = false,
}) => {

  const renderOptions = () => {
    const options = Object.values(TaskStatus);
    return options.map((status) => (
      <option key={status} value={status}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </option>
    ));
  };

  return (
    <select
      id="status-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="status-filter"
      disabled={disabled}
      aria-disabled={disabled}
    >
      {showAllOption && <option value="">All Tasks</option>}
      {renderOptions()}
    </select>
  );
};
