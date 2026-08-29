import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { areaService } from '@/services/areaService';
import type { Area } from '@/types/Area';
import './AreaManagementPage.css';

const AreaManagementPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [population, setPopulation] = useState(1000);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);

  const fetchAreas = async () => {
    try {
      const data = await areaService.getAll();
      setAreas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const openCreateModal = () => {
    setSelectedArea(null);
    setName('');
    setZone('');
    setDescription('');
    setPopulation(1000);
    setStatus('ACTIVE');
    setPriority('MEDIUM');
    setLatitude(12.9716);
    setLongitude(77.5946);
    setShowModal(true);
  };

  const openEditModal = (area: Area) => {
    setSelectedArea(area);
    setName(area.name);
    setZone(area.zone);
    setDescription(area.description || '');
    setPopulation(area.populationEstimate);
    setStatus(area.status);
    setPriority(area.priority);
    setLatitude(area.latitude || 12.9716);
    setLongitude(area.longitude || 77.5946);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedArea) {
        // Edit mode
        await areaService.update(selectedArea.id, {
          name,
          zone,
          description,
          populationEstimate: Number(population),
          status,
          priority,
          latitude: Number(latitude),
          longitude: Number(longitude),
        });
      } else {
        // Create mode
        await areaService.create({
          name,
          zone,
          description,
          populationEstimate: Number(population),
          collectionPointCount: 0,
          status,
          priority,
          latitude: Number(latitude),
          longitude: Number(longitude),
          createdDate: new Date().toISOString(),
        });
      }
      fetchAreas();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this area?')) {
      try {
        await areaService.delete(id);
        fetchAreas();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <MainLayout>
      <div className="area-management-page">
        <header className="page-header">
          <div>
            <h1>Area Management</h1>
            <p>Define and monitor administrative collection areas.</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            + New Area
          </button>
        </header>

        {loading ? (
          <div className="loading">Loading areas...</div>
        ) : (
          <div className="table-container">
            <table className="area-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Zone</th>
                  <th>Population Est.</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name}</strong>
                    </td>
                    <td>{a.zone}</td>
                    <td>{a.populationEstimate.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${a.priority.toLowerCase()}`}>{a.priority}</span>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => openEditModal(a)} className="btn btn-secondary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{selectedArea ? 'Edit Area' : 'New Area'}</h3>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Area Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Zone / Sector</label>
                  <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Population Estimate</label>
                  <input type="number" value={population} onChange={(e) => setPopulation(Number(e.target.value))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(Number(e.target.value))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select value={status} onChange={(e: any) => setStatus(e.target.value)}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={priority} onChange={(e: any) => setPriority(e.target.value)}>
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
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

export default AreaManagementPage;
