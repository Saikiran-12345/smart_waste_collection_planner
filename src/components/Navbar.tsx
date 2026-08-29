import React from 'react';
import { useAuth } from '@/services/authService';
import { ThemeContext } from '@/context/ThemeContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = React.useContext(ThemeContext);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="app-title">Smart Waste Planner</span>
      </div>
      <div className="navbar-right">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {user && (
          <div className="user-info">
            <span>{user.username} ({user.role})</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
