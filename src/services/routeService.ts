import { areaService } from '../services/areaService';
import type { Area } from '../types/Area';
import { getDistanceBetween } from '../utils/distanceHelper';

/** Greedy nearest‑neighbor route optimizer. */
export const routeService = {
  async computeRoute(startAreaId: string) {
    const areas: Area[] = await areaService.getAll();
    const startArea = areas.find(a => a.id === startAreaId);
    if (!startArea) throw new Error('Start area not found');
    const remaining = new Set(areas.map(a => a.id));
    const route: string[] = [];
    let totalDistance = 0;
    let current = startArea;
    while (remaining.size > 0) {
      route.push(current.id);
      remaining.delete(current.id);
      let nearestId: string | null = null;
      let nearestDist = Infinity;
      for (const id of remaining) {
        const candidate = areas.find(a => a.id === id)!;
        const dist = getDistanceBetween(current.latitude, current.longitude, candidate.latitude, candidate.longitude);
        if (dist < nearestDist) { nearestDist = dist; nearestId = candidate.id; }
      }
      if (nearestId) {
        totalDistance += nearestDist;
        current = areas.find(a => a.id === nearestId)!;
      } else break;
    }
    return { route, totalDistance };
  }
};
