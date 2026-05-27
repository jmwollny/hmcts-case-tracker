import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrafficLight } from '../src/components/TrafficLight';

describe('TrafficLight Component', () => {
  const MOCK_NOW = new Date('2026-06-25T12:00:00');
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the "Overdue" status when the due date is in the past', () => {
    // 1 day in the past
    const pastDueDate = new Date(MOCK_NOW.getTime() - ONE_DAY_MS);

    render(<TrafficLight dueDate={pastDueDate} />);

    const badge = screen.getByText('Overdue');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('trafficlight-status-overdue');
  });

  it('should render the "Due soon" warning status when less than 48 hours remain', () => {
    // 24 hours in the future (well within the 48-hour threshold)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const TWO_DAYS = ONE_DAY_MS * 2;
    const futureDueDate = new Date(MOCK_NOW.getTime() + TWO_DAYS);

    render(<TrafficLight dueDate={futureDueDate} />);

    const badge = screen.getByText('Due in 48h');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('trafficlight-status-warning');
  });

  it('should render the "On track" safe status when more than 48 hours remain', () => {
    const THREE_DAYS = ONE_DAY_MS * 3;
    // 72 hours (3 days) in the future
    const safeDueDate = new Date(MOCK_NOW.getTime() + THREE_DAYS);

    render(<TrafficLight dueDate={safeDueDate} />);

    const badge = screen.getByText('On Track');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('trafficlight-status-safe');
  });
});