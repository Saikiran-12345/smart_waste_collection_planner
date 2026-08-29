import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scheduleService } from '../services/scheduleService';
import { readAll } from '../repository/repository';

vi.mock('../repository/repository', () => ({
  create: vi.fn(),
  readAll: vi.fn(),
  readOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe('scheduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters schedules by vehicle id', async () => {
    const mockSchedules = [
      { id: '1', areaId: 'A1', collectionPointId: 'C1', date: '2026-08-29', startTime: '08:00', endTime: '12:00', vehicleId: 'veh-1', driverId: 'drv-1', status: 'SCHEDULED' as const },
      { id: '2', areaId: 'A2', collectionPointId: 'C2', date: '2026-08-29', startTime: '08:00', endTime: '12:00', vehicleId: 'veh-2', driverId: 'drv-2', status: 'SCHEDULED' as const },
    ];

    vi.mocked(readAll).mockReturnValue(mockSchedules);

    const filtered = await scheduleService.getByVehicle('veh-2');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('filters schedules by driver id', async () => {
    const mockSchedules = [
      { id: '1', areaId: 'A1', collectionPointId: 'C1', date: '2026-08-29', startTime: '08:00', endTime: '12:00', vehicleId: 'veh-1', driverId: 'drv-1', status: 'SCHEDULED' as const },
      { id: '2', areaId: 'A2', collectionPointId: 'C2', date: '2026-08-29', startTime: '08:00', endTime: '12:00', vehicleId: 'veh-2', driverId: 'drv-2', status: 'SCHEDULED' as const },
    ];

    vi.mocked(readAll).mockReturnValue(mockSchedules);

    const filtered = await scheduleService.getByDriver('drv-1');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('filters schedules by date', async () => {
    const mockSchedules = [
      { id: '1', areaId: 'A1', collectionPointId: 'C1', date: '2026-08-28', startTime: '08:00', endTime: '12:00', vehicleId: 'veh-1', driverId: 'drv-1', status: 'SCHEDULED' as const },
      { id: '2', areaId: 'A2', collectionPointId: 'C2', date: '2026-08-29', startTime: '08:00', endTime: '12:00', vehicleId: 'veh-2', driverId: 'drv-2', status: 'SCHEDULED' as const },
    ];

    vi.mocked(readAll).mockReturnValue(mockSchedules);

    const filtered = await scheduleService.getByDate('2026-08-29');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });
});
