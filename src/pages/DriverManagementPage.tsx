import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { driverService } from '@/services/driverService';
import type { Driver } from '@/types/Driver';
import './DriverManagementPage.css';

const DriverManagementPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseType, setLicenseType] = useState('CLASS_B');
  const [experienceYears, setExperienceYears] = useState(2);
  const [status, setStatus] = useState<'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY'>('AVAILABLE');

  const fetchDrivers = async () => {
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openCreateModal = () => {
    setSelectedDriver(null);
    setName('');
    setPhone('');
    setLicenseType('CLASS_B');
    setExperienceYears(2);
    setStatus('AVAILABLE');
    setShowModal(true);
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setName(driver.name);
    setPhone(driver.phone);
    setLicenseType(driver.licenseType);
    setExperienceYears(driver.experienceYears);
    setStatus(driver.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedDriver) {
        await driverService.update(selectedDriver.id, {
          name,
          phone,
          licenseType,
          experienceYears: Number(experienceYears),
          status,
        });
      } else {
        await driverService.create({
          name,
          phone,
          licenseType,
          experienceYears: Number(experienceYears),
          status,
          totalCollections: 0,
          completedCollections: 0,
          missedCollections: 0,
        });
      }
      fetchDrivers();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.delete(id);
        fetchDrivers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <MainLayout>
      <div className="driver-management-page">
        <header className="page-header">
          <div>
            <h1>Driver Roster Management</h1>
            <p>Administer vehicle operators, certifications, and availability.</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            + Add Operator
          </button>
        </header>

        {loading ? (
          <div className="loading">Loading operators...</div>
        ) : (
          <div className="table-container">
            <table className="driver-table">
              <thead>
                <tr>
                  <th>Operator Name</th>
                  <th>Contact Info</th>
                  <th>License Tier</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.name}</strong>
                    </td>
                    <td>{d.phone}</td>
                    <td>{d.licenseType}</td>
                    <td>{d.experienceYears} Years</td>
                    <td>
                      <span className={`badge badge-${d.status.toLowerCase().replace('_', '')}`}>{d.status.replace('_', ' ')}</span>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => openEditModal(d)} className="btn btn-secondary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="btn btn-danger btn-sm">
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
              <h3>{selectedDriver ? 'Edit Operator Profile' : 'New Operator Profile'}</h3>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>License Type</label>
                    <select value={licenseType} onChange={(e) => setLicenseType(e.target.value)}>
                      <option value="CLASS_A">CLASS A (Heavy Rig)</option>
                      <option value="CLASS_B">CLASS B (Heavy Single)</option>
                      <option value="CLASS_C">CLASS C (Standard commercial)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Experience (Years)</label>
                    <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="OFF_DUTY">OFF DUTY</option>
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

export default DriverManagementPage;
