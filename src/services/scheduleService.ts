import { create, readAll, readOne, update, remove } from '../repository/repository';
import type { Schedule } from '../types/Schedule';

/**
 * Service for managing waste collection schedules.
 * Provides CRUD operations and queries for calendars/shifts.
 */
export const scheduleService = {
  /** Create a new schedule entry */
  async create(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    return await create<Schedule>('Schedule', schedule);
  },

  /** Get all schedules */
  async getAll(): Promise<Schedule[]> {
    return await readAll<Schedule>('Schedule');
  },

  /** Get a schedule by ID */
  async getById(id: string): Promise<Schedule | undefined> {
    return await readOne<Schedule>('Schedule', id);
  },

  /** Update an existing schedule */
  async update(id: string, updates: Partial<Omit<Schedule, 'id'>>): Promise<Schedule> {
    return await update<Schedule>('Schedule', id, updates);
  },

  /** Delete a schedule */
  async delete(id: string): Promise<void> {
    return await remove('Schedule', id);
  },

  /** Get schedules for a specific vehicle */
  async getByVehicle(vehicleId: string): Promise<Schedule[]> {
    const all = await this.getAll();
    return all.filter((s: Schedule) => s.vehicleId === vehicleId);
  },

  /** Get schedules for a specific driver */
  async getByDriver(driverId: string): Promise<Schedule[]> {
    const all = await this.getAll();
    return all.filter((s: Schedule) => s.driverId === driverId);
  },

  /** Get schedules for a specific date (YYYY-MM-DD) */
  async getByDate(dateStr: string): Promise<Schedule[]> {
    const all = await this.getAll();
    return all.filter((s: Schedule) => s.date === dateStr);
  },
};
