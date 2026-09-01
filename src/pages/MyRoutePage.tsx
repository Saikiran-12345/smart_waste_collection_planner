import React from 'react';
import MainLayout from '../components/MainLayout';
import './MyRoutePage.css';

const MyRoutePage: React.FC = () => {
  const stops = [
    { id: 1, name: 'Grand St Bin #1', lat: 12.9716, lon: 77.5946, status: 'pending' },
    { id: 2, name: 'Oak Ave Bin #2', lat: 12.9720, lon: 77.5950, status: 'pending' },
    { id: 3, name: 'Pine Rd Bin #3', lat: 12.9730, lon: 77.5960, status: 'pending' },
    { id: 4, name: 'Maple Blvd Bin #4', lat: 12.9740, lon: 77.5970, status: 'pending' },
    { id: 5, name: 'Cedar Ln Bin #5', lat: 12.9750, lon: 77.5980, status: 'pending' },
    { id: 6, name: 'Elm Dr Bin #6', lat: 12.9760, lon: 77.5990, status: 'pending' },
  ];

  return (
    <MainLayout>
      <div className="myroute-page">
        <h1>My Route</h1>
        <p className="route-summary">
          Today's route has <strong>{stops.length} stops</strong>. Follow the order below for the optimized path.
        </p>

        <div className="route-timeline">
          {stops.map((stop, idx) => (
            <div key={stop.id} className={`timeline-item ${stop.status}`}>
              <div className="timeline-marker">
                <span className="step-number">{idx + 1}</span>
              </div>
              <div className="timeline-content">
                <h3>{stop.name}</h3>
                <p className="coords">({stop.lat.toFixed(4)}, {stop.lon.toFixed(4)})</p>
                <span className={`route-status ${stop.status}`}>
                  {stop.status === 'pending' ? 'Pending' : 'Collected'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default MyRoutePage;
