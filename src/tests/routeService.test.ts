import { describe, it, expect, beforeEach, vi } from 'vitest';
import { routeService } from '../services/routeService';
import { areaService } from '../services/areaService';

vi.mock('../services/areaService', () => ({
  areaService: {
    getAll: vi.fn(),
  },
}));

describe('routeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('computes nearest neighbor route in correct order', async () => {
    const mockAreas = [
      { id: 'area-start', name: 'Start', zone: 'Z1', populationEstimate: 1000, collectionPointCount: 1, status: 'ACTIVE' as const, priority: 'LOW' as const, createdDate: '2026', latitude: 12.9716, longitude: 77.5946 },
      { id: 'area-far', name: 'Far Area', zone: 'Z2', populationEstimate: 1000, collectionPointCount: 1, status: 'ACTIVE' as const, priority: 'LOW' as const, createdDate: '2026', latitude: 14.5000, longitude: 78.5000 },
      { id: 'area-near', name: 'Near Area', zone: 'Z3', populationEstimate: 1000, collectionPointCount: 1, status: 'ACTIVE' as const, priority: 'LOW' as const, createdDate: '2026', latitude: 12.9720, longitude: 77.5950 },
    ];

    vi.mocked(areaService.getAll).mockResolvedValue(mockAreas);

    const result = await routeService.computeRoute('area-start');

    // Nearest should be 'area-near', then 'area-far'
    expect(result.route).toEqual(['area-start', 'area-near', 'area-far']);
    expect(result.totalDistance).toBeGreaterThan(0);
  });
});
