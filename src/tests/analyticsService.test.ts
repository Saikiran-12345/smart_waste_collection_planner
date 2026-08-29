import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from '../services/analyticsService';
import { readAll } from '../repository/repository';

vi.mock('../repository/repository', () => ({
  create: vi.fn(),
  readAll: vi.fn(),
  readOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aggregates overview stats properly', async () => {
    const mockRecords = [
      { id: '1', collectionPointId: 'C1', date: '2026-08-29', time: '10:00', levelPercentage: 80, category: 'GENERAL' as const, recordedBy: 'admin' },
      { id: '2', collectionPointId: 'C2', date: '2026-08-29', time: '10:00', levelPercentage: 40, category: 'RECYCLABLE' as const, recordedBy: 'admin' },
    ];
    const mockComplaints = [
      { id: '1', areaId: 'A1', collectionPointId: 'C1', type: 'OVERFLOWING_BIN' as const, description: 'bin full', date: '2026-08-29', priority: 'HIGH' as const, status: 'OPEN' as const },
    ];
    const mockAreas = [
      { id: '1', name: 'Area 1', zone: 'Z1', populationEstimate: 1000, collectionPointCount: 1, status: 'ACTIVE' as const, priority: 'LOW' as const, createdDate: '2026', latitude: 0, longitude: 0 },
    ];
    const mockVehicles = [
      { id: '1', registrationNumber: 'V1', plateNumber: 'V1', type: 'COMPACTOR' as const, capacity: 5000, currentLoad: 0, status: 'ACTIVE' as const, latitude: 0, longitude: 0 },
    ];

    vi.mocked(readAll).mockImplementation((type: string) => {
      if (type === 'WasteRecord') return mockRecords;
      if (type === 'Complaint') return mockComplaints;
      if (type === 'Area') return mockAreas;
      if (type === 'Vehicle') return mockVehicles;
      return [];
    });

    const stats = await analyticsService.getOverviewStats();

    expect(stats.totalAreas).toBe(1);
    expect(stats.totalVehicles).toBe(1);
    expect(stats.avgFillLevel).toBe(60); // (80 + 40) / 2
    expect(stats.openComplaints).toBe(1);
  });
});
