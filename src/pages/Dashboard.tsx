import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import StatCard from '@/components/StatCard';
import { analyticsService } from '@/services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryFill[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const summary = await analyticsService.getOverviewStats();
        const cats = await analyticsService.getWasteCategoryFillLevels();
        const trend = await analyticsService.getWasteLevelTrend();

        setStats(summary);
        setCategoryData(cats);
        setTrendData(trend);
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
        <div className="loading-container">Loading Dashboard Data...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>System Overview</h1>
          <p>Real-time analytics and status updates for waste collection planning.</p>
        </header>

        {stats && (
          <div className="stats-grid">
            <StatCard
              title="Collection Areas"
              value={stats.totalAreas}
              icon="🗺️"
              description="Total monitored zones"
              color="#3b82f6"
            />
            <StatCard
              title="Fleet Status"
              value={`${stats.activeVehicles} / ${stats.totalVehicles}`}
              icon="🚛"
              description="Active / Total vehicles"
              color="#10b981"
            />
            <StatCard
              title="Average Bin Fill Level"
              value={`${stats.avgFillLevel}%`}
              icon="🗑️"
              description="Across all categories"
              color="#f59e0b"
            />
            <StatCard
              title="Open Complaints"
              value={stats.openComplaints}
              icon="⚠️"
              description="Awaiting resolution"
              color="#ef4444"
            />
          </div>
        )}

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Average Fill Level by Category</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="averageFillLevel" fill="#10b981" name="Avg Fill Level (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3>Waste Fill Level Trend</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="averageLevel" stroke="#3b82f6" strokeWidth={2} name="Avg Level" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
