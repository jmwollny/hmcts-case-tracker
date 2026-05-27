import React from 'react';
import './TrafficLight.css';

interface TrafficLightProps {
  dueDate: Date;
}

export const TrafficLight: React.FC<TrafficLightProps> = ({ dueDate }) => {
  const timeDiff = dueDate.getTime() - Date.now();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  // 1. Overdue!!
  if (hoursDiff < 0) {
    return (
      <div className="trafficlight-badge trafficlight-status-overdue">
        <span className="trafficlight-dot trafficlight-dot-overdue" />
        Overdue
      </div>
    );
  }

  // 2. Close to overdue (less than 48 hours remaining)
  if (hoursDiff <= 48) {
    // If it's less than 1 hour, say "Due within an hour", otherwise state the hours
    const displayHours = Math.ceil(hoursDiff);
    const label = displayHours <= 1 ? "Due within an hour" : `Due in ${displayHours}h`;

    return (
      <div className="trafficlight-badge trafficlight-status-warning">
        <span className="trafficlight-dot trafficlight-dot-warning" />
        {label}
      </div>
    );
  }

  // 3. Plenty of time
  return (
    <div className="trafficlight-badge trafficlight-status-safe">
      <span className="trafficlight-dot trafficlight-dot-safe" />
      On Track
    </div>
  );
};