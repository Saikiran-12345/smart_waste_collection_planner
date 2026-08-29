import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { persistenceService } from '@/services/persistenceService';
import './DataManagementPage.css';

const DataManagementPage: React.FC = () => {
  const [backupString, setBackupString] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleExport = async () => {
    const backup = await persistenceService.exportBackup();
    setBackupString(backup);
    setSuccessMsg('Backup generated successfully. Copy the JSON below.');
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupString) return;

    const ok = await persistenceService.importBackup(backupString);
    if (ok) {
      setSuccessMsg('System database restored successfully! Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      alert('Failed to restore backup. Check the JSON syntax.');
    }
  };

  const handleClear = async () => {
    if (confirm('CRITICAL WARNING: This will delete ALL collection points, areas, vehicles, drivers, and records. This cannot be undone. Clear database?')) {
      await persistenceService.clearAllData();
      setSuccessMsg('Database cleared. Reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <MainLayout>
      <div className="data-management-page">
        <header className="page-header">
          <div>
            <h1>Database & Data Management</h1>
            <p>Export backups, restore databases, or factory reset the application state.</p>
          </div>
        </header>

        {successMsg && <div className="alert-success">{successMsg}</div>}

        <div className="management-grid">
          <div className="management-card">
            <h3>Backup / Restore System Data</h3>
            <form onSubmit={handleImport}>
              <div className="form-group">
                <label>Database JSON Payload</label>
                <textarea
                  value={backupString}
                  onChange={(e) => setBackupString(e.target.value)}
                  placeholder="Paste database JSON export here to restore, or click Generate Backup..."
                />
              </div>

              <div className="actions-row">
                <button type="button" onClick={handleExport} className="btn btn-secondary">
                  Generate Backup
                </button>
                <button type="submit" className="btn btn-primary">
                  Restore Data
                </button>
              </div>
            </form>
          </div>

          <div className="management-card danger-card">
            <h3>System Reset</h3>
            <p>Clears all tables (Areas, Vehicles, Drivers, Schedules, Records) in the browser local storage database.</p>
            <button onClick={handleClear} className="btn btn-danger btn-lg">
              Factory Reset Database
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DataManagementPage;
