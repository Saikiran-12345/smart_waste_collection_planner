import { areaService } from './areaService';
import type { Area } from '../types/Area';
import { getDistanceBetween } from '../utils/distanceHelper';

export interface SAConfig {
  initialTemperature: number;
  coolingRate: number;
  minimumTemperature: number;
  iterationsPerTemp: number;
  neighborhoodOperator: 'SWAP' | 'REVERSE' | 'SCRAMBLE' | 'TWO_OPT';
  coolingSchedule: 'LINEAR' | 'GEOMETRIC' | 'LOGARITHMIC';
}

export interface SARunSummary {
  temperature: number;
  bestDistance: number;
  currentDistance: number;
  acceptedMoves: number;
}

export class SimulatedAnnealingSolver {
  private areas: Area[] = [];
  private startAreaId: string = '';
  private distanceMatrix: Record<string, Record<string, number>> = {};
  private config: SAConfig;
  private history: SARunSummary[] = [];

  constructor(config: Partial<SAConfig> = {}) {
    this.config = {
      initialTemperature: config.initialTemperature ?? 10000,
      coolingRate: config.coolingRate ?? 0.95,
      minimumTemperature: config.minimumTemperature ?? 0.01,
      iterationsPerTemp: config.iterationsPerTemp ?? 150,
      neighborhoodOperator: config.neighborhoodOperator ?? 'TWO_OPT',
      coolingSchedule: config.coolingSchedule ?? 'GEOMETRIC',
    };
  }

  public async initialize(startAreaId: string): Promise<void> {
    this.startAreaId = startAreaId;
    this.areas = await areaService.getAll();
    if (this.areas.length < 2) {
      throw new Error('Simulated Annealing requires at least two areas to run optimization.');
    }
    this.calculateDistanceMatrix();
  }

  private calculateDistanceMatrix(): void {
    this.distanceMatrix = {};
    for (const a1 of this.areas) {
      this.distanceMatrix[a1.id] = {};
      for (const a2 of this.areas) {
        if (a1.id === a2.id) {
          this.distanceMatrix[a1.id][a2.id] = 0;
        } else {
          this.distanceMatrix[a1.id][a2.id] = getDistanceBetween(
            a1.latitude,
            a1.longitude,
            a2.latitude,
            a2.longitude
          );
        }
      }
    }
  }

  private calculateDistance(chromosome: string[]): number {
    let distance = 0;
    let currentId = this.startAreaId;

    for (const nextId of chromosome) {
      distance += this.distanceMatrix[currentId][nextId] || 0;
      currentId = nextId;
    }

    distance += this.distanceMatrix[currentId][this.startAreaId] || 0;
    return distance;
  }

  private generateInitialSolution(): string[] {
    const list = this.areas
      .map(a => a.id)
      .filter(id => id !== this.startAreaId);
    
    // Shuffle to create a random starting route
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  private getNeighbor(solution: string[]): string[] {
    const neighbor = [...solution];
    const n = neighbor.length;

    if (this.config.neighborhoodOperator === 'SWAP') {
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
    } else if (this.config.neighborhoodOperator === 'REVERSE') {
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      const [lower, upper] = i < j ? [i, j] : [j, i];
      const rev = neighbor.slice(lower, upper + 1).reverse();
      neighbor.splice(lower, rev.length, ...rev);
    } else if (this.config.neighborhoodOperator === 'SCRAMBLE') {
      const i = Math.floor(Math.random() * n);
      const j = Math.floor(Math.random() * n);
      const [lower, upper] = i < j ? [i, j] : [j, i];
      const sc = neighbor.slice(lower, upper + 1);
      // Shuffle scrambled sublist
      for (let k = sc.length - 1; k > 0; k--) {
        const r = Math.floor(Math.random() * (k + 1));
        [sc[k], sc[r]] = [sc[r], sc[k]];
      }
      neighbor.splice(lower, sc.length, ...sc);
    } else {
      // 2-OPT Local Search step
      const i = Math.floor(Math.random() * (n - 1));
      const j = Math.floor(Math.random() * (n - i)) + i + 1;
      const part = neighbor.slice(i, j).reverse();
      neighbor.splice(i, part.length, ...part);
    }

    return neighbor;
  }

  private getNextTemperature(t: number, step: number): number {
    if (this.config.coolingSchedule === 'LINEAR') {
      const coolingStep = (this.config.initialTemperature - this.config.minimumTemperature) / 500;
      return Math.max(this.config.minimumTemperature, t - coolingStep);
    } else if (this.config.coolingSchedule === 'LOGARITHMIC') {
      return this.config.initialTemperature / Math.log(step + 2);
    } else {
      // GEOMETRIC
      return t * this.config.coolingRate;
    }
  }

  public run(): { route: string[]; distance: number; history: SARunSummary[] } {
    this.history = [];
    let currentSolution = this.generateInitialSolution();
    let currentDistance = this.calculateDistance(currentSolution);

    let bestSolution = [...currentSolution];
    let bestDistance = currentDistance;

    let temperature = this.config.initialTemperature;
    let step = 0;

    while (temperature > this.config.minimumTemperature) {
      let acceptedMoves = 0;

      for (let i = 0; i < this.config.iterationsPerTemp; i++) {
        const neighbor = this.getNeighbor(currentSolution);
        const neighborDistance = this.calculateDistance(neighbor);

        const delta = neighborDistance - currentDistance;

        // If delta is negative, the neighbor is better, always accept it.
        // Otherwise, accept with a probability governed by Metropolis criterion.
        if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
          currentSolution = neighbor;
          currentDistance = neighborDistance;
          acceptedMoves++;

          if (currentDistance < bestDistance) {
            bestDistance = currentDistance;
            bestSolution = [...currentSolution];
          }
        }
      }

      this.history.push({
        temperature,
        bestDistance,
        currentDistance,
        acceptedMoves,
      });

      step++;
      temperature = this.getNextTemperature(temperature, step);
    }

    const finalRoute = [this.startAreaId, ...bestSolution, this.startAreaId];
    return {
      route: finalRoute,
      distance: bestDistance,
      history: this.history,
    };
  }
}
