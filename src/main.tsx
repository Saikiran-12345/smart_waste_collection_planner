import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializationService } from './services/initializationService';
import './index.css';

// Seed initial dataset if storage is empty
initializationService.initializeIfEmpty();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
