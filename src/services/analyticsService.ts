import { readAll } from '../repository/repository';
import type { WasteRecord } from '../types/WasteRecord';
import type { Complaint } from '../types/Complaint';
import type { Area } from '../types/Area';
import type { Vehicle } from '../types/Vehicle';

/**
 * Service for aggregating analytics data.
 * Computes KPIs, trends, and charts for the dashboards.
 */
export const analyticsService = {
  /** Get overview summary counts */
  async getOverviewStats() {
    const records = await readAll('WasteRecord') as WasteRecord[];
    const complaints = await readAll('Complaint') as Complaint[];
    const areas = await readAll('Area') as Area[];
    const vehicles = await readAll('Vehicle') as Vehicle[];

    const totalLevel = records.reduce((acc, r) => acc + r.levelPercentage, 0);
    const avgFillLevel = records.length ? (totalLevel / records.length) : 0;

    const openComplaintsCount = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
    const activeVehiclesCount = vehicles.filter(v => v.status === 'ACTIVE').length;

    return {
      totalAreas: areas.length,
      totalVehicles: vehicles.length,
      activeVehicles: activeVehiclesCount,
      avgFillLevel: Math.round(avgFillLevel),
      openComplaints: openComplaintsCount,
      totalComplaints: complaints.length,
    };
  },

  /** Get fill levels grouped by waste category */
  async getWasteCategoryFillLevels() {
    const records = await readAll('WasteRecord') as WasteRecord[];
    const categories = ['GENERAL', 'RECYCLABLE', 'ORGANIC', 'PLASTIC', 'PAPER', 'GLASS', 'ELECTRONIC'];
    const results: Record<string, { total: number; count: number }> = {};

    categories.forEach(cat => {
      results[cat] = { total: 0, count: 0 };
    });

    records.forEach(r => {
      if (results[r.category]) {
        results[r.category].total += r.levelPercentage;
        results[r.category].count += 1;
      }
    });

    return Object.keys(results).map(key => ({
      category: key,
      averageFillLevel: results[key].count ? Math.round(results[key].total / results[key].count) : 0,
      totalRecords: results[key].count,
    }));
  },

  /** Get monthly or daily waste level trend */
  async getWasteLevelTrend() {
    const records = await readAll('WasteRecord') as WasteRecord[];
    // Group records by date (YYYY-MM-DD)
    const grouped: Record<string, { total: number; count: number }> = {};

    records.forEach(r => {
      const date = r.date.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { total: 0, count: 0 };
      }
      grouped[date].total += r.levelPercentage;
      grouped[date].count += 1;
    });

    return Object.keys(grouped).sort().map(date => ({
      date,
      averageLevel: Math.round(grouped[date].total / grouped[date].count),
    }));
  },

  /** Get complaint statistics grouped by type */
  async getComplaintTypeStats() {
    const complaints = await readAll('Complaint') as Complaint[];
    const types: Record<string, number> = {};

    complaints.forEach(c => {
      types[c.type] = (types[c.type] || 0) + 1;
    });

    return Object.keys(types).map(type => ({
      type,
      count: types[type],
    }));
  },
};
