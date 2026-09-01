import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/services/authService';
import { analyticsService } from '@/services/analyticsService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import './Dashboard.css';

interface SummaryStats {
  totalAreas: number;
  totalVehicles: number;
  activeVehicles: number;
  avgFillLevel: number;
  openComplaints: number;
  totalComplaints: number;
}

interface CategoryFill {
  category: string;
  averageFillLevel: number;
  totalRecords: number;
}

interface TrendData {
  date: string;
  averageLevel: number;
}

interface ComplaintType {
  type: string;
  count: number;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryFill[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [summary, cats, trend, complaints] = await Promise.all([
          analyticsService.getOverviewStats(),
          analyticsService.getWasteCategoryFillLevels(),
          analyticsService.getWasteLevelTrend(),
          analyticsService.getComplaintTypeStats(),
        ]);
        setStats(summary);
        setCategoryData(cats);
        setTrendData(trend);
        setComplaintTypes(complaints);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  const fillLevelStatus = stats
    ? stats.avgFillLevel > 75 ? 'critical' : stats.avgFillLevel > 50 ? 'warning' : 'healthy'
    : 'healthy';

  return (
    <MainLayout>
      <div className="dashboard-container">
        {/* ── Greeting Banner ──────────────────────────────────── */}
        <section className="greeting-banner">
          <div className="greeting-text">
            <h1>{getGreeting()}, {user?.username ?? 'Operator'}</h1>
            <p className="greeting-date">{getFormattedDate()}</p>
            <p className="greeting-sub">Here's what's happening across your waste collection network today.</p>
          </div>
        </section>

        {/* ── KPI Cards ────────────────────────────────────────── */}
        {stats && (
          <section className="kpi-section">
            <div className="kpi-card">
              <div className="kpi-icon kpi-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-label">Collection Zones</span>
                <span className="kpi-value">{stats.totalAreas}</span>
                <span className="kpi-desc">Active monitoring areas</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon kpi-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-label">Fleet Active</span>
                <span className="kpi-value">{stats.activeVehicles}<span className="kpi-total"> / {stats.totalVehicles}</span></span>
                <span className="kpi-desc">Vehicles on road today</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className={`kpi-icon kpi-${fillLevelStatus === 'critical' ? 'red' : fillLevelStatus === 'warning' ? 'amber' : 'green'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/><path d="M9 3h6"/></svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-label">Avg Bin Fill</span>
                <span className="kpi-value">{stats.avgFillLevel}%</span>
                <span className={`kpi-desc status-${fillLevelStatus}`}>
                  {fillLevelStatus === 'critical' ? 'Needs immediate attention' : fillLevelStatus === 'warning' ? 'Approaching threshold' : 'Within safe levels'}
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className={`kpi-icon ${stats.openComplaints > 10 ? 'kpi-red' : 'kpi-amber'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div className="kpi-body">
                <span className="kpi-label">Open Complaints</span>
                <span className="kpi-value">{stats.openComplaints}</span>
                <span className="kpi-desc">{stats.totalComplaints} total filed</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Charts ───────────────────────────────────────────── */}
        <section className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Fill Level by Waste Category</h3>
              <span className="chart-badge">{categoryData.length} categories</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                    formatter={(value: number) => [`${value}%`, 'Avg Fill']}
                  />
                  <Bar dataKey="averageFillLevel" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Avg Fill Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Daily Fill Level Trend</h3>
              <span className="chart-badge">{trendData.length} days</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                    formatter={(value: number) => [`${value}%`, 'Avg Level']}
                  />
                  <Line type="monotone" dataKey="averageLevel" stroke="#10b981" strokeWidth={2.5} dot={false} name="Avg Level" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Complaints by Type</h3>
              <span className="chart-badge">{complaintTypes.reduce((a, c) => a + c.count, 0)} total</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={complaintTypes}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  >
                    {complaintTypes.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <a href="/routes" className="action-card">
              <span className="action-icon">🛣️</span>
              <span className="action-label">Plan Route</span>
              <span className="action-desc">Optimize collection paths</span>
            </a>
            <a href="/analytics" className="action-card">
              <span className="action-icon">📊</span>
              <span className="action-label">Forecasting</span>
              <span className="action-desc">Predict waste volumes</span>
            </a>
            <a href="/reports" className="action-card">
              <span className="action-icon">📄</span>
              <span className="action-label">Generate Report</span>
              <span className="action-desc">Export CSV or PDF</span>
            </a>
            <a href="/schedules" className="action-card">
              <span className="action-icon">📅</span>
              <span className="action-label">View Schedules</span>
              <span className="action-desc">Collection calendars</span>
            </a>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
