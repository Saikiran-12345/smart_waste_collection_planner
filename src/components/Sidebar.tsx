import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/services/authService';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          </li>
          {role === 'ADMIN' && (
            <>
              <li><NavLink to="/areas" className={({ isActive }) => (isActive ? 'active' : '')}>Areas</NavLink></li>
              <li><NavLink to="/collection-points" className={({ isActive }) => (isActive ? 'active' : '')}>Collection Points</NavLink></li>
              <li><NavLink to="/vehicles" className={({ isActive }) => (isActive ? 'active' : '')}>Vehicles</NavLink></li>
              <li><NavLink to="/drivers" className={({ isActive }) => (isActive ? 'active' : '')}>Drivers</NavLink></li>
              <li><NavLink to="/routes" className={({ isActive }) => (isActive ? 'active' : '')}>Routes</NavLink></li>
              <li><NavLink to="/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>Analytics</NavLink></li>
              <li><NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>Reports</NavLink></li>
              <li><NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>Notifications</NavLink></li>
              <li><NavLink to="/data-management" className={({ isActive }) => (isActive ? 'active' : '')}>Data Management</NavLink></li>
            </>
          )}
          {role === 'OPERATOR' && (
            <>
              <li><NavLink to="/collection-points" className={({ isActive }) => (isActive ? 'active' : '')}>Collection Points</NavLink></li>
              <li><NavLink to="/schedules" className={({ isActive }) => (isActive ? 'active' : '')}>Schedules</NavLink></li>
              <li><NavLink to="/routes" className={({ isActive }) => (isActive ? 'active' : '')}>Routes</NavLink></li>
              <li><NavLink to="/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>Analytics</NavLink></li>
              <li><NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>Reports</NavLink></li>
            </>
          )}
          {role === 'DRIVER' && (
            <>
              <li><NavLink to="/driver-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>My Dashboard</NavLink></li>
              <li><NavLink to="/my-route" className={({ isActive }) => (isActive ? 'active' : '')}>My Route</NavLink></li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
