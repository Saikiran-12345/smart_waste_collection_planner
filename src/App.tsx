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
import CollectionPointsPage from '@/pages/CollectionPointsPage';
import NotificationPage from '@/pages/NotificationPage';
import DriverDashboardPage from '@/pages/DriverDashboardPage';
import MyRoutePage from '@/pages/MyRoutePage';
import { AuthProvider, useAuth } from '@/services/authService';
import { ThemeProvider } from '@/context/ThemeContext';
import './App.css';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // While auth state is being resolved, show nothing (prevents flash redirect)
  if (isLoading) return null;

  return user ? children : <Navigate to="/login" replace />;
};

const RedirectIfLoggedIn: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<RedirectIfLoggedIn />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/areas" element={<RequireAuth><AreaManagementPage /></RequireAuth>} />
            <Route path="/collection-points" element={<RequireAuth><CollectionPointsPage /></RequireAuth>} />
            <Route path="/vehicles" element={<RequireAuth><VehicleManagementPage /></RequireAuth>} />
            <Route path="/drivers" element={<RequireAuth><DriverManagementPage /></RequireAuth>} />
            <Route path="/routes" element={<RequireAuth><RoutePlannerPage /></RequireAuth>} />
            <Route path="/schedules" element={<RequireAuth><SchedulePage /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><ReportPage /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationPage /></RequireAuth>} />
            <Route path="/data-management" element={<RequireAuth><DataManagementPage /></RequireAuth>} />
            <Route path="/driver-dashboard" element={<RequireAuth><DriverDashboardPage /></RequireAuth>} />
            <Route path="/my-route" element={<RequireAuth><MyRoutePage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
