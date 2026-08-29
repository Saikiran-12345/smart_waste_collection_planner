import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { areaService } from '@/services/areaService';
import { routeService } from '@/services/routeService';
import type { Area } from '@/types/Area';
import './RoutePlannerPage.css';

const RoutePlannerPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [startAreaId, setStartAreaId] = useState('');
  const [optimizedRoute, setOptimizedRoute] = useState<string[]>([]);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    async function loadAreas() {
      const data = await areaService.getAll();
      setAreas(data);
      if (data.length > 0) {
        setStartAreaId(data[0].id);
      }
    }
    loadAreas();
  }, []);

  const handleRunOptimizer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startAreaId) return;

    setCalculating(true);
    try {
      const result = await routeService.computeRoute(startAreaId);
      setOptimizedRoute(result.route);
      setTotalDistance(result.totalDistance);
    } catch (err) {
      console.error(err);
      alert('Error calculating route. Make sure geographic coordinates are correct.');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <MainLayout>
      <div className="route-planner-page">
        <header className="page-header">
          <div>
            <h1>Smart Routing Optimizer</h1>
            <p>Calculate efficient nearest-neighbor routes visiting all designated areas.</p>
          </div>
        </header>

        <div className="planner-grid">
          <div className="planner-card control-card">
            <h3>Routing Constraints</h3>
            <form onSubmit={handleRunOptimizer}>
              <div className="form-group">
                <label>Starting Collection Area</label>
                <select value={startAreaId} onChange={(e) => setStartAreaId(e.target.value)}>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Optimization Strategy</label>
                <select disabled>
                  <option>Greedy Nearest-Neighbor (Deterministic)</option>
                </select>
              </div>

              <button type="submit" disabled={calculating || !startAreaId} className="btn btn-primary btn-block">
                {calculating ? 'Calculating Path...' : 'Optimize Collection Route'}
              </button>
            </form>
          </div>

          <div className="planner-card output-card">
            <h3>Calculated Route Waypoints</h3>
            {totalDistance !== null ? (
              <div className="results-container">
                <div className="metric-row">
                  <div className="metric-box">
                    <span className="metric-label">Total Distance</span>
                    <span className="metric-value">{(totalDistance / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Stop Count</span>
                    <span className="metric-value">{optimizedRoute.length} zones</span>
                  </div>
                </div>

                <div className="timeline">
                  {optimizedRoute.map((areaId, index) => {
                    const area = areas.find((a) => a.id === areaId);
                    return (
                      <div key={areaId} className="timeline-item">
                        <div className="timeline-badge">{index + 1}</div>
                        <div className="timeline-panel">
                          <h4>{area?.name || areaId}</h4>
                          <p>{area?.zone || 'Zone details unknown'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📍</span>
                <p>Select a starting point and click Optimize to generate collection path routing.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RoutePlannerPage;
