import { create, readAll, readOne, update, remove } from '../repository/repository';
import { Area } from '../types/Area';

/**
 * Service for managing Area entities.
 * Provides CRUD operations plus some domain‑specific utilities.
 */
export const areaService = {
  /** Create a new area */
  create: (area: Omit<Area, 'id'> & { id?: string }) => create<Area>('Area', area),

  /** Get all areas */
  getAll: (): Area[] => readAll<Area>('Area'),

  /** Get a single area by ID */
  getById: (id: string): Area | undefined => readOne<Area>('Area', id),

  /** Update an existing area */
  update: (id: string, updates: Partial<Omit<Area, 'id'>>) => update<Area>('Area', id, updates),

  /** Delete an area */
  delete: (id: string) => remove('Area', id),

  /** Compute total population across all active areas */
  getTotalPopulation: (): number => {
    const areas = readAll('Area') as Area[];
    return areas.reduce((sum, a) => sum + (a.populationEstimate ?? 0), 0);
  },

  /** Count active vs inactive areas */
  getStatusCounts: (): { active: number; inactive: number } => {
    const areas = readAll('Area') as Area[];
    return areas.reduce(
      (acc, a) => {
        if (a.status === 'ACTIVE') acc.active++;
        else acc.inactive++;
        return acc;
      },
      { active: 0, inactive: 0 }
    );
  },
};
