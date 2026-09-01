import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { collectionPointService } from '../services/collectionPointService';
import type { CollectionPoint } from '../types/CollectionPoint';
import './CollectionPointsPage.css';

const CollectionPointsPage: React.FC = () => {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', latitude: '', longitude: '', areaId: '', capacity: '200', status: 'active'
  });

  useEffect(() => { loadPoints(); }, []);

  const loadPoints = async () => {
    const all = await collectionPointService.getAll();
    setPoints(all);
  };

  const filteredPoints = points.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.areaId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: formData.name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      areaId: formData.areaId,
      capacity: parseInt(formData.capacity),
      status: formData.status,
    };
    if (editingId) {
      await collectionPointService.update(editingId, payload);
    } else {
      await collectionPointService.create(payload);
    }
    resetForm();
    loadPoints();
  };

  const handleEdit = (p: CollectionPoint) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      latitude: String(p.latitude),
      longitude: String(p.longitude),
      areaId: p.areaId,
      capacity: String(p.capacity),
      status: p.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await collectionPointService.delete(id);
    loadPoints();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', latitude: '', longitude: '', areaId: '', capacity: '200', status: 'active' });
  };

  return (
    <MainLayout>
      <div className="cp-page">
        <div className="page-header">
          <h1>Collection Points</h1>
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Point
          </button>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or area..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="filter-btns">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <span className="count-label">{filteredPoints.length} points</span>
        </div>

        {showForm && (
          <div className="form-card">
            <h3>{editingId ? 'Edit Collection Point' : 'New Collection Point'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Area ID</label>
                  <input required value={formData.areaId} onChange={e => setFormData({ ...formData, areaId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input required type="number" step="any" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input required type="number" step="any" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Capacity (L)</label>
                  <input required type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Area</th>
                <th>Lat</th>
                <th>Lon</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoints.length === 0 ? (
                <tr><td colSpan={7} className="empty">No collection points found.</td></tr>
              ) : filteredPoints.slice(0, 50).map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.areaId}</td>
                  <td>{p.latitude.toFixed(4)}</td>
                  <td>{p.longitude.toFixed(4)}</td>
                  <td>{p.capacity} L</td>
                  <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                  <td className="actions-cell">
                    <button className="btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPoints.length > 50 && (
            <div className="truncation-note">Showing 50 of {filteredPoints.length} points. Use search to narrow down.</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CollectionPointsPage;
