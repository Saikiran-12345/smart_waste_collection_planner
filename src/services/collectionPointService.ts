import { create, readAll, readOne, update, remove } from '../repository/repository';
import type { CollectionPoint } from '../types/CollectionPoint';
import { getDistanceBetween } from '../utils/distanceHelper';

/** Service for managing collection points */
export const collectionPointService = {
  async create(point: Omit<CollectionPoint, 'id'>): Promise<CollectionPoint> {
    return await create<CollectionPoint>('CollectionPoint', point);
  },

  async getAll(): Promise<CollectionPoint[]> {
    return await readAll<CollectionPoint>('CollectionPoint');
  },

  async getById(id: string): Promise<CollectionPoint | undefined> {
    return await readOne<CollectionPoint>('CollectionPoint', id);
  },

  async update(id: string, updates: Partial<Omit<CollectionPoint, 'id'>>): Promise<CollectionPoint> {
    return await update<CollectionPoint>('CollectionPoint', id, updates);
  },

  async delete(id: string): Promise<void> {
    return await remove('CollectionPoint', id);
  },

  async distanceToVehicle(pointId: string, vehicle: { latitude: number; longitude: number }): Promise<number> {
    const point = await this.getById(pointId);
    if (!point) throw new Error('Collection point not found');
    return getDistanceBetween(point.latitude, point.longitude, vehicle.latitude, vehicle.longitude);
  },

  async findNearestVehicle(pointId: string, vehicles: Array<{ id: string; latitude: number; longitude: number }>): Promise<string | null> {
    const point = await this.getById(pointId);
    if (!point) throw new Error('Collection point not found');
    let nearest: null | { id: string; distance: number } = null;
    for (const v of vehicles) {
      const d = getDistanceBetween(point.latitude, point.longitude, v.latitude, v.longitude);
      if (!nearest || d < nearest.distance) nearest = { id: v.id, distance: d };
    }
    return nearest?.id ?? null;
  },
};
