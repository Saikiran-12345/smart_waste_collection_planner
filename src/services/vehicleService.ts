import { create, readAll, readOne, update, remove } from '../repository/repository';
import { Vehicle } from '../types/Vehicle';

/** Service for managing Vehicle entities */
export const vehicleService = {
  create: (vehicle: Omit<Vehicle, 'id'> & { id?: string }) => create<Vehicle>('Vehicle', vehicle),
  getAll: (): Vehicle[] => readAll<Vehicle>('Vehicle'),
  getById: (id: string): Vehicle | undefined => readOne<Vehicle>('Vehicle', id),
  update: (id: string, updates: Partial<Omit<Vehicle, 'id'>>) => update<Vehicle>('Vehicle', id, updates),
  delete: (id: string) => remove('Vehicle', id),

  /** Compute total capacity of all available vehicles */
  getTotalCapacity: (): number => {
    const vehicles = readAll('Vehicle') as Vehicle[];
    return vehicles.reduce((sum, v) => sum + (v.capacity ?? 0), 0);
  },

  /** Get count of vehicles by status */
  getStatusCounts: (): Record<string, number> => {
    const vehicles = readAll('Vehicle') as Vehicle[];
    return vehicles.reduce((acc, v) => {
      const status = v.status ?? 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },
};
