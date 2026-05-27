import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Accordian } from '../src/components/Accordian';

describe('Accordian Component', () => {
  const mockTitle = 'Task Details';
  const mockContent = 'This is the hidden accordion content.';

  it('should render the title and be closed by default', () => {
    render(<Accordian title={mockTitle}>{mockContent}</Accordian>);

    // Check title is visible
    expect(screen.getByRole('button', { name: mockTitle })).toBeInTheDocument();

    /// Check content is NOT in the DOM
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();

    // 3. Confirm accessibility attribute indicates it is collapsed
    const headerButton = screen.getByRole('button', { name: mockTitle });
    expect(headerButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('should render the title and be open', () => {
    render(<Accordian title={mockTitle}>{mockContent}</Accordian>);

    // Check title is visible
    expect(screen.getByRole('button', { name: mockTitle })).toBeInTheDocument();

    /// Check content is NOT in the DOM
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();

    // 3. Confirm accessibility attribute indicates it is collapsed
    const headerButton = screen.getByRole('button', { name: mockTitle });
    expect(headerButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('should render expanded when defaultOpen prop is true', () => {
    render(
      <Accordian title={mockTitle} defaultOpen={true}>
        {mockContent}
      </Accordian>
    );

    // Content should be visible immediately
    expect(screen.getByText(mockContent)).toBeInTheDocument();
    
    const headerButton = screen.getByRole('button', { name: mockTitle });
    expect(headerButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('should toggle content visibility when clicked', () => {
    render(<Accordian title={mockTitle}>{mockContent}</Accordian>);

    const headerButton = screen.getByRole('button', { name: mockTitle });

    // Click to Open
    fireEvent.click(headerButton);
    expect(screen.getByText(mockContent)).toBeInTheDocument();
    expect(headerButton).toHaveAttribute('aria-expanded', 'true');

    // Click to Close
    fireEvent.click(headerButton);
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
    expect(headerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should toggle visibility using the Enter key', () => {
    render(<Accordian title={mockTitle}>{mockContent}</Accordian>);

    const headerButton = screen.getByRole('button', { name: mockTitle });

    // Press Enter to open
    fireEvent.keyUp(headerButton, { key: 'Enter' });
    expect(screen.getByText(mockContent)).toBeInTheDocument();

    // Press Enter to close
    fireEvent.keyUp(headerButton, { key: 'Enter' });
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
  });

  it('should toggle visibility using the Space key', () => {
    render(<Accordian title={mockTitle}>{mockContent}</Accordian>);

    const headerButton = screen.getByRole('button', { name: mockTitle });

    // Press Space to open
    fireEvent.keyUp(headerButton, { key: ' ' });
    expect(screen.getByText(mockContent)).toBeInTheDocument();

    // Press Space to close
    fireEvent.keyUp(headerButton, { key: ' ' });
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
  });
});