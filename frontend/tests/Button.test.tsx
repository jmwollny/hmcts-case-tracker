import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../src/components/Button';

describe('Button Component', () => {
  it('should render with the text and default styling classes', () => {
    render(<Button text="Click Me" />);
    const button = screen.getByRole('button', { name: 'Click Me' });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button');
    expect(button).toHaveClass('button-normal');
    expect(button).toHaveClass('button-primary');
    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(button).not.toBeDisabled();
  });

  it('should apply custom size and colour classes correctly', () => {
    render(<Button text="Danger Zone" size="large" colour="danger" className="custom-utility" />);

    const buttonEl = screen.getByRole('button', { name: 'Danger Zone' });

    expect(buttonEl).toHaveClass('button-large');
    expect(buttonEl).toHaveClass('button-danger');
    expect(buttonEl).toHaveClass('custom-utility');
  });

  it('should fire the onClick callback when clicked', () => {
    const mockOnClick = vi.fn();
    render(<Button text="Interactive" onClick={mockOnClick} />);

    const buttonEl = screen.getByRole('button', { name: 'Interactive' });
    fireEvent.click(buttonEl);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled and block click actions when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    render(<Button text="Locked" disabled={true} onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Locked' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // Attempt a user click interaction
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});