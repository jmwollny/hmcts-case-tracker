import React, { useState, type ReactNode } from 'react';
import './Accordian.css';

interface AccordianProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

export const Accordian: React.FC<AccordianProps> = ({
  title,
  children,
  defaultOpen = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const toggleVisibility = () => {
    // Passing a function means that React automatically provides the previous value argument
    setIsOpen((previous) => !previous);
  };

  const handleKeyStroke = (evt: { key: any; preventDefault: () => void }) => {
    switch (evt.key) {
      case ' ':
      case 'Enter':
        evt.preventDefault();
        toggleVisibility();
        break;
      default:
        return;
    }
  };

  const getContainerClass = () => disabled ? 'accordian-container disabled' : 'accordian-container';

  return (
    <div className={getContainerClass()}>
      <div
        role="button"
        tabIndex={0}
        aria-label={title}
        onClick={toggleVisibility}
        onKeyUp={handleKeyStroke}
        className="accordian-button"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span className="accordian-title">{title}</span>
        <span className="accordian-icon">{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && (
        <div
          className="accordian-content"
          role="region"
          aria-labelledby="{title}"
        >
          {children}
        </div>
      )}
    </div>
  );
};
