import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-page">
      <h2>Smart Waste Planner – Demo Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="login-button">Login</button>
      </form>
      <div className="demo-credentials">
        <p>Demo accounts:</p>
        <ul>
          <li>Admin – admin / admin123</li>
          <li>Operator – operator / operator123</li>
          <li>Driver – driver / driver123</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;
