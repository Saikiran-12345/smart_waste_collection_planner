import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectionPointService } from '../services/collectionPointService';
import { readOne } from '../repository/repository';

vi.mock('../repository/repository', () => ({
  create: vi.fn(),
  readAll: vi.fn(),
  readOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe('collectionPointService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates the correct distance to a vehicle', async () => {
    const mockPoint = {
      id: 'point-1',
      name: 'Bin 1',
      latitude: 12.9716, // Bangalore centroid
      longitude: 77.5946,
      areaId: 'area-1',
      status: 'active' as const,
      capacity: 100,
    };

    vi.mocked(readOne).mockReturnValue(mockPoint);

    // Coordinate approx 1.1km away
    const vehicleCoords = {
      latitude: 12.9816,
      longitude: 77.5946,
    };

    const distance = await collectionPointService.distanceToVehicle('point-1', vehicleCoords);

    // 1000m to 1200m range
    expect(distance).toBeGreaterThan(1000);
    expect(distance).toBeLessThan(1200);
  });

  it('finds the nearest vehicle from a list', async () => {
    const mockPoint = {
      id: 'point-1',
      name: 'Bin 1',
      latitude: 12.9716,
      longitude: 77.5946,
      areaId: 'area-1',
      status: 'active' as const,
      capacity: 100,
    };

    vi.mocked(readOne).mockReturnValue(mockPoint);

    const vehicles = [
      { id: 'far-veh', latitude: 13.5000, longitude: 78.5000 },
      { id: 'near-veh', latitude: 12.9720, longitude: 77.5950 },
    ];

    const nearestId = await collectionPointService.findNearestVehicle('point-1', vehicles);

    expect(nearestId).toBe('near-veh');
  });
});
