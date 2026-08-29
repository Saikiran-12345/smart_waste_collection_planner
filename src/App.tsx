import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import AreaManagementPage from '@/pages/AreaManagementPage';
import VehicleManagementPage from '@/pages/VehicleManagementPage';
import DriverManagementPage from '@/pages/DriverManagementPage';
import RoutePlannerPage from '@/pages/RoutePlannerPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ReportPage from '@/pages/ReportPage';
import DataManagementPage from '@/pages/DataManagementPage';
import SchedulePage from '@/pages/SchedulePage';
import { AuthProvider, useAuth } from '@/services/authService';
import { ThemeProvider } from '@/context/ThemeContext';
import './App.css';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/areas" element={<RequireAuth><AreaManagementPage /></RequireAuth>} />
            <Route path="/vehicles" element={<RequireAuth><VehicleManagementPage /></RequireAuth>} />
            <Route path="/drivers" element={<RequireAuth><DriverManagementPage /></RequireAuth>} />
            <Route path="/routes" element={<RequireAuth><RoutePlannerPage /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><ReportPage /></RequireAuth>} />
            <Route path="/data-management" element={<RequireAuth><DataManagementPage /></RequireAuth>} />
            <Route path="/schedules" element={<RequireAuth><SchedulePage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
