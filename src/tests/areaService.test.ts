import { describe, it, expect, beforeEach, vi } from 'vitest';
import { areaService } from '../services/areaService';
import { create, readAll, readOne, update, remove } from '../repository/repository';

// Mock repository functions
vi.mock('../repository/repository', () => ({
  create: vi.fn(),
  readAll: vi.fn(),
  readOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe('areaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an area successfully', async () => {
    const mockArea = {
      name: 'North Sector',
      zone: 'Zone A',
      populationEstimate: 5000,
      collectionPointCount: 2,
      status: 'ACTIVE' as const,
      priority: 'HIGH' as const,
      createdDate: '2026-08-29',
      latitude: 12.9716,
      longitude: 77.5946,
    };

    vi.mocked(create).mockReturnValue({ id: 'area-123', ...mockArea });

    const result = await areaService.create(mockArea);

    expect(create).toHaveBeenCalledWith('Area', mockArea);
    expect(result).toHaveProperty('id', 'area-123');
    expect(result.name).toBe('North Sector');
  });

  it('gets all areas', async () => {
    const mockAreas = [
      { id: '1', name: 'Area 1', zone: 'Z1', populationEstimate: 1000, collectionPointCount: 1, status: 'ACTIVE' as const, priority: 'LOW' as const, createdDate: '2026', latitude: 0, longitude: 0 },
      { id: '2', name: 'Area 2', zone: 'Z2', populationEstimate: 2000, collectionPointCount: 2, status: 'INACTIVE' as const, priority: 'MEDIUM' as const, createdDate: '2026', latitude: 0, longitude: 0 },
    ];

    vi.mocked(readAll).mockReturnValue(mockAreas);

    const result = await areaService.getAll();

    expect(readAll).toHaveBeenCalledWith('Area');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Area 1');
  });

  it('calculates total population across all active and inactive areas', async () => {
    const mockAreas = [
      { id: '1', name: 'Area 1', zone: 'Z1', populationEstimate: 1500, collectionPointCount: 1, status: 'ACTIVE' as const, priority: 'LOW' as const, createdDate: '2026', latitude: 0, longitude: 0 },
      { id: '2', name: 'Area 2', zone: 'Z2', populationEstimate: 3500, collectionPointCount: 2, status: 'INACTIVE' as const, priority: 'MEDIUM' as const, createdDate: '2026', latitude: 0, longitude: 0 },
    ];

    vi.mocked(readAll).mockReturnValue(mockAreas);

    const totalPop = areaService.getTotalPopulation();

    expect(totalPop).toBe(5000);
  });

  it('computes correct status counts', async () => {
    const mockAreas = [
      { id: '1', name: 'Area 1', zone: 'Z1', populationEstimate: 1000, collectionPointCount: 1, status: 'ACTIVE' as const, priority: 'LOW' as const, createdDate: '2026', latitude: 0, longitude: 0 },
      { id: '2', name: 'Area 2', zone: 'Z2', populationEstimate: 2000, collectionPointCount: 2, status: 'INACTIVE' as const, priority: 'MEDIUM' as const, createdDate: '2026', latitude: 0, longitude: 0 },
      { id: '3', name: 'Area 3', zone: 'Z3', populationEstimate: 3000, collectionPointCount: 3, status: 'ACTIVE' as const, priority: 'HIGH' as const, createdDate: '2026', latitude: 0, longitude: 0 },
    ];

    vi.mocked(readAll).mockReturnValue(mockAreas);

    const counts = areaService.getStatusCounts();

    expect(counts).toEqual({ active: 2, inactive: 1 });
  });
});
