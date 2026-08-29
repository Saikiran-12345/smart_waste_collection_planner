import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { areaService } from '@/services/areaService';
import { vehicleService } from '@/services/vehicleService';
import { reportService } from '@/services/reportService';
import './ReportPage.css';

const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState('areas');
  const [exportFormat, setExportFormat] = useState('csv');
  const [generating, setGenerating] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      if (reportType === 'areas') {
        const areas = await areaService.getAll();
        const exportData = areas.map((a) => ({
          ID: a.id,
          Name: a.name,
          Zone: a.zone,
          Population: a.populationEstimate,
          Priority: a.priority,
          Status: a.status,
          Created: a.createdDate,
        }));

        if (exportFormat === 'csv') {
          reportService.downloadCSV(exportData, `area_report_${Date.now()}.csv`);
        } else {
          const headers = ['Name', 'Zone', 'Population', 'Priority', 'Status'];
          const rows = exportData.map((d) => [d.Name, d.Zone, d.Population.toString(), d.Priority, d.Status]);
          reportService.exportSummaryPDF('Area Monitored Zones Report', headers, rows, `area_report_${Date.now()}.pdf`);
        }
      } else {
        const vehicles = await vehicleService.getAll();
        const exportData = vehicles.map((v) => ({
          ID: v.id,
          PlateNumber: v.plateNumber,
          Type: v.type,
          Capacity: v.capacity,
          CurrentLoad: v.currentLoad,
          Status: v.status,
        }));

        if (exportFormat === 'csv') {
          reportService.downloadCSV(exportData, `fleet_report_${Date.now()}.csv`);
        } else {
          const headers = ['Plate No.', 'Type', 'Capacity (kg)', 'Current Load (kg)', 'Status'];
          const rows = exportData.map((d) => [d.PlateNumber, d.Type, d.Capacity.toString(), d.CurrentLoad.toString(), d.Status]);
          reportService.exportSummaryPDF('Fleet Operations Report', headers, rows, `fleet_report_${Date.now()}.pdf`);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error generating report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <MainLayout>
      <div className="report-page">
        <header className="page-header">
          <div>
            <h1>Report Generator</h1>
            <p>Compile and download collection logs, fleet reports, and operational metrics.</p>
          </div>
        </header>

        <div className="report-card">
          <form onSubmit={handleExport}>
            <div className="form-group">
              <label>Report Subject</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="areas">Collection Areas & Demographics</option>
                <option value="vehicles">Fleet Vehicle Status & Load Logs</option>
              </select>
            </div>

            <div className="form-group">
              <label>Export Format</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" value="csv" checked={exportFormat === 'csv'} onChange={() => setExportFormat('csv')} />
                  CSV Spreadsheet
                </label>
                <label className="radio-label">
                  <input type="radio" value="pdf" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} />
                  PDF Document
                </label>
              </div>
            </div>

            <button type="submit" disabled={generating} className="btn btn-primary btn-block btn-lg">
              {generating ? 'Exporting...' : 'Generate & Download'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportPage;
