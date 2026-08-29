import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { areaService } from '@/services/areaService';
import { mlService } from '@/services/mlService';
import { analyticsService } from '@/services/analyticsService';
import type { Area } from '@/types/Area';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import './AnalyticsPage.css';

interface ForecastResult {
  forecastValue: number;
  explanation: string;
}

interface CategoryFill {
  category: string;
  averageFillLevel: number;
  totalRecords: number;
}

const AnalyticsPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [categoryData, setCategoryData] = useState<CategoryFill[]>([]);

  useEffect(() => {
    async function loadInitial() {
      const allAreas = await areaService.getAll();
      setAreas(allAreas);
      if (allAreas.length > 0) {
        setSelectedAreaId(allAreas[0].id);
      }
      const cats = await analyticsService.getWasteCategoryFillLevels();
      setCategoryData(cats);
    }
    loadInitial();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId) return;

    setCalculating(true);
    try {
      const res = await mlService.forecastWasteForArea(selectedAreaId);
      setForecast({
        forecastValue: res.forecastValue,
        explanation: res.explanation,
      });
    } catch (err) {
      console.error(err);
      alert('Error running model prediction.');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <MainLayout>
      <div className="analytics-page">
        <header className="page-header">
          <div>
            <h1>Advanced Analytics & ML Forecasts</h1>
            <p>Predict future waste generation using linear regression ML models.</p>
          </div>
        </header>

        <div className="analytics-grid">
          <div className="analytics-card predict-card">
            <h3>ML Waste Generation Predictor</h3>
            <form onSubmit={handlePredict}>
              <div className="form-group">
                <label>Target Administrative Area</label>
                <select value={selectedAreaId} onChange={(e) => setSelectedAreaId(e.target.value)}>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Pop: {a.populationEstimate.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={calculating || !selectedAreaId} className="btn btn-primary btn-block">
                {calculating ? 'Running model...' : 'Calculate Forecast'}
              </button>
            </form>

            {forecast && (
              <div className="forecast-result">
                <h4>Predicted Waste Load</h4>
                <div className="forecast-value">{forecast.forecastValue} kg</div>
                <div className="forecast-explanation">{forecast.explanation}</div>
              </div>
            )}
          </div>

          <div className="analytics-card chart-card-large">
            <h3>Detailed Waste Category Levels</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="averageFillLevel" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
