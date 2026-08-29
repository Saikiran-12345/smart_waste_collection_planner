import { describe, it, expect, beforeEach, vi } from 'vitest';
import { driverService } from '../services/driverService';
import { create, readAll, readOne, update } from '../repository/repository';

vi.mock('../repository/repository', () => ({
  create: vi.fn(),
  readAll: vi.fn(),
  readOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe('driverService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets only available drivers', async () => {
    const mockDrivers = [
      { id: '1', name: 'John Doe', phone: '123', licenseType: 'B', experienceYears: 5, status: 'AVAILABLE' as const, totalCollections: 0, completedCollections: 0, missedCollections: 0 },
      { id: '2', name: 'Jane Smith', phone: '456', licenseType: 'A', experienceYears: 10, status: 'ASSIGNED' as const, totalCollections: 0, completedCollections: 0, missedCollections: 0 },
    ];

    vi.mocked(readAll).mockReturnValue(mockDrivers);

    const available = await driverService.getAvailable();

    expect(available).toHaveLength(1);
    expect(available[0].name).toBe('John Doe');
  });

  it('assigns a vehicle to a driver', async () => {
    const mockDriver = {
      id: '1',
      name: 'John Doe',
      phone: '123',
      licenseType: 'B',
      experienceYears: 5,
      status: 'AVAILABLE' as const,
      totalCollections: 0,
      completedCollections: 0,
      missedCollections: 0,
    };

    vi.mocked(readOne).mockReturnValue(mockDriver);
    vi.mocked(update).mockReturnValue({ ...mockDriver, assignedVehicleId: 'veh-999', status: 'ASSIGNED' as const } as any);

    const result = await driverService.assignVehicle('1', 'veh-999');

    expect(readOne).toHaveBeenCalledWith('Driver', '1');
    expect(update).toHaveBeenCalledWith('Driver', '1', {
      assignedVehicleId: 'veh-999',
      status: 'ASSIGNED',
    });
    expect(result.status).toBe('ASSIGNED');
    expect(result.assignedVehicleId).toBe('veh-999');
  });
});
