import React from 'react';
import MainLayout from '../components/MainLayout';
import './DriverDashboardPage.css';

const DriverDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="driver-dash">
        <h1>My Dashboard</h1>
        <div className="dash-grid">
          <div className="dash-card">
            <h3>Today's Route</h3>
            <p className="dash-value">12 stops</p>
            <p className="dash-label">Scheduled collection points</p>
          </div>
          <div className="dash-card">
            <h3>Completed</h3>
            <p className="dash-value completed">0 / 12</p>
            <p className="dash-label">Collections done today</p>
          </div>
          <div className="dash-card">
            <h3>Vehicle Status</h3>
            <p className="dash-value available">Available</p>
            <p className="dash-label">Current load: 0 kg</p>
          </div>
          <div className="dash-card">
            <h3>Performance</h3>
            <p className="dash-value">98%</p>
            <p className="dash-label">On-time completion rate</p>
          </div>
        </div>

        <div className="today-schedule">
          <h2>Today's Schedule</h2>
          <div className="schedule-list">
            <div className="schedule-item">
              <span className="time">08:00</span>
              <span className="stop-name">Grand St Bin #1</span>
              <span className="schedule-status pending">Pending</span>
            </div>
            <div className="schedule-item">
              <span className="time">08:30</span>
              <span className="stop-name">Oak Ave Bin #2</span>
              <span className="schedule-status pending">Pending</span>
            </div>
            <div className="schedule-item">
              <span className="time">09:00</span>
              <span className="stop-name">Pine Rd Bin #3</span>
              <span className="schedule-status pending">Pending</span>
            </div>
            <div className="schedule-item">
              <span className="time">09:30</span>
              <span className="stop-name">Maple Blvd Bin #4</span>
              <span className="schedule-status pending">Pending</span>
            </div>
            <div className="schedule-item">
              <span className="time">10:00</span>
              <span className="stop-name">Cedar Ln Bin #5</span>
              <span className="schedule-status pending">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DriverDashboardPage;
