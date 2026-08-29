import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  description?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, color }) => {
  return (
    <div className="stat-card" style={{ borderLeftColor: color || '#22c55e' }}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <div className="stat-card-value">{value}</div>
      {description && <div className="stat-card-description">{description}</div>}
    </div>
  );
};

export default StatCard;
