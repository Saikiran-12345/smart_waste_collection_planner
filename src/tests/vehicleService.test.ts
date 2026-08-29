import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vehicleService } from '../services/vehicleService';
import { create, readAll, readOne, update, remove } from '../repository/repository';

vi.mock('../repository/repository', () => ({
  create: vi.fn(),
  readAll: vi.fn(),
  readOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe('vehicleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a vehicle successfully', async () => {
    const mockVehicle = {
      registrationNumber: 'KA-01-1234',
      plateNumber: 'KA-01-1234',
      type: 'COMPACTOR' as const,
      capacity: 8000,
      currentLoad: 0,
      status: 'ACTIVE' as const,
      latitude: 12.9716,
      longitude: 77.5946,
    };

    vi.mocked(create).mockReturnValue({ id: 'veh-123', ...mockVehicle });

    const result = await vehicleService.create(mockVehicle);

    expect(create).toHaveBeenCalledWith('Vehicle', mockVehicle);
    expect(result).toHaveProperty('id', 'veh-123');
  });

  it('gets total capacity of all vehicles', async () => {
    const mockVehicles = [
      { id: '1', registrationNumber: 'V1', plateNumber: 'V1', type: 'COMPACTOR' as const, capacity: 5000, currentLoad: 1000, status: 'AVAILABLE' as const, latitude: 0, longitude: 0 },
      { id: '2', registrationNumber: 'V2', plateNumber: 'V2', type: 'DUMP_TRUCK' as const, capacity: 10000, currentLoad: 2000, status: 'MAINTENANCE' as const, latitude: 0, longitude: 0 },
    ];

    vi.mocked(readAll).mockReturnValue(mockVehicles);

    const totalCapacity = vehicleService.getTotalCapacity();

    expect(readAll).toHaveBeenCalledWith('Vehicle');
    expect(totalCapacity).toBe(15000);
  });

  it('gets count of vehicles by status', async () => {
    const mockVehicles = [
      { id: '1', registrationNumber: 'V1', plateNumber: 'V1', type: 'COMPACTOR' as const, capacity: 5000, currentLoad: 0, status: 'AVAILABLE' as const, latitude: 0, longitude: 0 },
      { id: '2', registrationNumber: 'V2', plateNumber: 'V2', type: 'DUMP_TRUCK' as const, capacity: 10000, currentLoad: 0, status: 'MAINTENANCE' as const, latitude: 0, longitude: 0 },
      { id: '3', registrationNumber: 'V3', plateNumber: 'V3', type: 'RECYCLING_TRUCK' as const, capacity: 7000, currentLoad: 0, status: 'AVAILABLE' as const, latitude: 0, longitude: 0 },
    ];

    vi.mocked(readAll).mockReturnValue(mockVehicles);

    const counts = vehicleService.getStatusCounts();

    expect(counts).toEqual({ AVAILABLE: 2, MAINTENANCE: 1 });
  });
});
