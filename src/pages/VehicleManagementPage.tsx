import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle } from '@/types/Vehicle';
import './VehicleManagementPage.css';

const VehicleManagementPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState(5000);
  const [currentLoad, setCurrentLoad] = useState(0);
  const [status, setStatus] = useState<Vehicle['status']>('ACTIVE');
  const [type, setType] = useState<Vehicle['type']>('REAR_LOADER');

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openCreateModal = () => {
    setSelectedVehicle(null);
    setPlateNumber('');
    setCapacity(5000);
    setCurrentLoad(0);
    setStatus('ACTIVE');
    setType('REAR_LOADER');
    setShowModal(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPlateNumber(vehicle.plateNumber);
    setCapacity(vehicle.capacity);
    setCurrentLoad(vehicle.currentLoad);
    setStatus(vehicle.status);
    setType(vehicle.type);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedVehicle) {
        await vehicleService.update(selectedVehicle.id, {
          plateNumber,
          registrationNumber: plateNumber,
          capacity: Number(capacity),
          currentLoad: Number(currentLoad),
          status,
          type,
        });
      } else {
        await vehicleService.create({
          plateNumber,
          registrationNumber: plateNumber,
          capacity: Number(capacity),
          currentLoad: Number(currentLoad),
          status,
          type,
          fuelLevel: 100,
          latitude: 12.9716, // Default fallback coordinates
          longitude: 77.5946,
          lastServiceDate: new Date().toISOString(),
        });
      }
      fetchVehicles();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.delete(id);
        fetchVehicles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <MainLayout>
      <div className="vehicle-management-page">
        <header className="page-header">
          <div>
            <h1>Vehicle Fleet Management</h1>
            <p>Monitor collection trucks, capacities, and maintenance schedules.</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            + Add Vehicle
          </button>
        </header>

        {loading ? (
          <div className="loading">Loading vehicles...</div>
        ) : (
          <div className="table-container">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Capacity Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => {
                  const usagePercentage = Math.round((v.currentLoad / v.capacity) * 100) || 0;
                  return (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.plateNumber}</strong>
                      </td>
                      <td>{v.type.replace('_', ' ')}</td>
                      <td>
                        <div className="capacity-bar-wrapper">
                          <div className="capacity-bar-bg">
                            <div className="capacity-bar-fill" style={{ width: `${Math.min(usagePercentage, 100)}%`, backgroundColor: usagePercentage > 85 ? '#ef4444' : '#22c55e' }}></div>
                          </div>
                          <span className="capacity-bar-text">
                            {v.currentLoad} / {v.capacity} kg ({usagePercentage}%)
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span>
                      </td>
                      <td className="actions-cell">
                        <button onClick={() => openEditModal(v)} className="btn btn-secondary btn-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="btn btn-danger btn-sm">
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
              <h3>{selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Plate Number</label>
                  <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)}>
                    <option value="REAR_LOADER">REAR LOADER</option>
                    <option value="SIDE_LOADER">SIDE LOADER</option>
                    <option value="FRONT_LOADER">FRONT LOADER</option>
                    <option value="ROLL_OFF">ROLL OFF</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity (kg)</label>
                    <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Current Load (kg)</label>
                    <input type="number" value={currentLoad} onChange={(e) => setCurrentLoad(Number(e.target.value))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
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

export default VehicleManagementPage;
