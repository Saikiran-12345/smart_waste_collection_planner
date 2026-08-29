import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="main-content-wrapper">
        <Sidebar />
        <main className="main-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
