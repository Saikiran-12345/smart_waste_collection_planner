import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { scheduleService } from '@/services/scheduleService';
import { areaService } from '@/services/areaService';
import { vehicleService } from '@/services/vehicleService';
import { driverService } from '@/services/driverService';
import type { Schedule } from '@/types/Schedule';
import type { Area } from '@/types/Area';
import type { Vehicle } from '@/types/Vehicle';
import type { Driver } from '@/types/Driver';
import './SchedulePage.css';

const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [areaId, setAreaId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [status, setStatus] = useState<'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'CANCELLED'>('SCHEDULED');

  const loadData = async () => {
    try {
      const [scheds, ars, vehs, drvs] = await Promise.all([
        scheduleService.getAll(),
        areaService.getAll(),
        vehicleService.getAll(),
        driverService.getAll(),
      ]) as [Schedule[], Area[], Vehicle[], Driver[]];
      setSchedules(scheds);
      setAreas(ars);
      setVehicles(vehs);
      setDrivers(drvs);

      if (ars.length > 0) setAreaId(ars[0].id);
      if (vehs.length > 0) setVehicleId(vehs[0].id);
      if (drvs.length > 0) setDriverId(drvs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scheduleService.create({
        areaId,
        collectionPointId: 'GEN_ALL', // Generic schedule for the whole area
        date,
        startTime,
        endTime,
        vehicleId,
        driverId,
        status,
      });
      loadData();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this schedule?')) {
      await scheduleService.delete(id);
      loadData();
    }
  };

  return (
    <MainLayout>
      <div className="schedule-page">
        <header className="page-header">
          <div>
            <h1>Collection Schedules</h1>
            <p>Roster vehicle dispatch and assign drivers to administrative zones.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Create Schedule
          </button>
        </header>

        {loading ? (
          <div className="loading">Loading roster...</div>
        ) : (
          <div className="table-container">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Area</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => {
                  const area = areas.find((a) => a.id === s.areaId);
                  const vehicle = vehicles.find((v) => v.id === s.vehicleId);
                  const driver = drivers.find((d) => d.id === s.driverId);
                  return (
                    <tr key={s.id}>
                      <td>{s.date}</td>
                      <td>{s.startTime} - {s.endTime}</td>
                      <td>{area?.name || s.areaId}</td>
                      <td>{vehicle?.plateNumber || s.vehicleId}</td>
                      <td>{driver?.name || s.driverId}</td>
                      <td>
                        <span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span>
                      </td>
                      <td className="actions-cell">
                        <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Create Roster Entry</h3>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Assign Area</label>
                  <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign Vehicle</label>
                  <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.plateNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign Driver</label>
                  <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SchedulePage;
