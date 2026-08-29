import { create, readAll, readOne, update, remove } from '../repository/repository';
import type { Driver } from '../types/Driver';

/**
 * Service for managing collection drivers.
 * Exposes full CRUD operations and assignment methods.
 */
export const driverService = {
  /** Create a new driver */
  async create(driver: Omit<Driver, 'id'>): Promise<Driver> {
    return await create<Driver>('Driver', driver);
  },

  /** Get all drivers */
  async getAll(): Promise<Driver[]> {
    return await readAll<Driver>('Driver');
  },

  /** Get a driver by ID */
  async getById(id: string): Promise<Driver | undefined> {
    return await readOne<Driver>('Driver', id);
  },

  /** Update driver properties */
  async update(id: string, updates: Partial<Omit<Driver, 'id'>>): Promise<Driver> {
    return await update<Driver>('Driver', id, updates);
  },

  /** Delete a driver */
  async delete(id: string): Promise<void> {
    return await remove('Driver', id);
  },

  /** Get all currently available drivers */
  async getAvailable(): Promise<Driver[]> {
    const all = await this.getAll();
    return all.filter((d: Driver) => d.status === 'AVAILABLE');
  },

  /** Assign a vehicle to a driver */
  async assignVehicle(driverId: string, vehicleId: string): Promise<Driver> {
    const driver = await this.getById(driverId);
    if (!driver) throw new Error('Driver not found');
    return await this.update(driverId, {
      assignedVehicleId: vehicleId,
      status: 'ASSIGNED',
    });
  },

  /** Unassign driver's current vehicle */
  async unassignVehicle(driverId: string): Promise<Driver> {
    const driver = await this.getById(driverId);
    if (!driver) throw new Error('Driver not found');
    return await this.update(driverId, {
      assignedVehicleId: undefined,
      status: 'AVAILABLE',
    });
  },
};
