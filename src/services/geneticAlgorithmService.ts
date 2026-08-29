import { areaService } from './areaService';
import type { Area } from '../types/Area';
import { getDistanceBetween } from '../utils/distanceHelper';

export interface GAConfig {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  elitismCount: number;
  selectionMethod: 'TOURNAMENT' | 'ROULETTE' | 'RANK';
  crossoverMethod: 'ORDER_ONE' | 'PMX' | 'CYCLE';
  mutationMethod: 'SWAP' | 'INVERSION' | 'SCRAMBLE';
}

export interface GARunSummary {
  generation: number;
  bestFitness: number;
  bestDistance: number;
  averageDistance: number;
}

export class GeneticAlgorithmSolver {
  private areas: Area[] = [];
  private startAreaId: string = '';
  private distanceMatrix: Record<string, Record<string, number>> = {};
  private population: string[][] = [];
  private fitnessScores: number[] = [];
  private config: GAConfig;
  private history: GARunSummary[] = [];

  constructor(config: Partial<GAConfig> = {}) {
    this.config = {
      populationSize: config.populationSize ?? 100,
      generations: config.generations ?? 200,
      crossoverRate: config.crossoverRate ?? 0.85,
      mutationRate: config.mutationRate ?? 0.05,
      elitismCount: config.elitismCount ?? 2,
      selectionMethod: config.selectionMethod ?? 'TOURNAMENT',
      crossoverMethod: config.crossoverMethod ?? 'ORDER_ONE',
      mutationMethod: config.mutationMethod ?? 'INVERSION',
    };
  }

  public async initialize(startAreaId: string): Promise<void> {
    this.startAreaId = startAreaId;
    this.areas = await areaService.getAll();
    if (this.areas.length < 2) {
      throw new Error('Genetic Algorithm requires at least two areas to optimize routing.');
    }
    this.calculateDistanceMatrix();
    this.generateInitialPopulation();
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

  private generateInitialPopulation(): void {
    this.population = [];
    const otherAreaIds = this.areas
      .map(a => a.id)
      .filter(id => id !== this.startAreaId);

    for (let i = 0; i < this.config.populationSize; i++) {
      const chromosome = [...otherAreaIds];
      this.shuffleArray(chromosome);
      this.population.push(chromosome);
    }
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private calculateDistance(chromosome: string[]): number {
    let distance = 0;
    let currentId = this.startAreaId;

    for (const nextId of chromosome) {
      distance += this.distanceMatrix[currentId][nextId] || 0;
      currentId = nextId;
    }

    // Return to start to complete the TSP tour loop
    distance += this.distanceMatrix[currentId][this.startAreaId] || 0;
    return distance;
  }

  private evaluatePopulation(): void {
    this.fitnessScores = [];
    for (const chromosome of this.population) {
      const dist = this.calculateDistance(chromosome);
      // Fitness is inverse of distance (scaled to avoid division by zero)
      const fitness = dist > 0 ? 1000000 / dist : 0;
      this.fitnessScores.push(fitness);
    }
  }

  private selectParent(): string[] {
    if (this.config.selectionMethod === 'TOURNAMENT') {
      return this.tournamentSelection();
    } else if (this.config.selectionMethod === 'ROULETTE') {
      return this.rouletteWheelSelection();
    } else {
      return this.rankSelection();
    }
  }

  private tournamentSelection(): string[] {
    const tournamentSize = 5;
    let bestIdx = -1;
    let bestFitness = -Infinity;

    for (let i = 0; i < tournamentSize; i++) {
      const randomIdx = Math.floor(Math.random() * this.population.length);
      const fit = this.fitnessScores[randomIdx];
      if (fit > bestFitness) {
        bestFitness = fit;
        bestIdx = randomIdx;
      }
    }
    return [...this.population[bestIdx]];
  }

  private rouletteWheelSelection(): string[] {
    const totalFitness = this.fitnessScores.reduce((a, b) => a + b, 0);
    if (totalFitness === 0) {
      return [...this.population[Math.floor(Math.random() * this.population.length)]];
    }
    let threshold = Math.random() * totalFitness;
    for (let i = 0; i < this.population.length; i++) {
      threshold -= this.fitnessScores[i];
      if (threshold <= 0) {
        return [...this.population[i]];
      }
    }
    return [...this.population[this.population.length - 1]];
  }

  private rankSelection(): string[] {
    const sortedIndices = this.fitnessScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => a.score - b.score)
      .map(item => item.index);

    const n = sortedIndices.length;
    const totalRankSum = (n * (n + 1)) / 2;
    let threshold = Math.random() * totalRankSum;

    for (let i = 0; i < n; i++) {
      const rank = i + 1; // 1-based rank
      threshold -= rank;
      if (threshold <= 0) {
        const actualIdx = sortedIndices[i];
        return [...this.population[actualIdx]];
      }
    }
    return [...this.population[sortedIndices[n - 1]]];
  }

  private crossover(parent1: string[], parent2: string[]): { child1: string[]; child2: string[] } {
    if (Math.random() > this.config.crossoverRate) {
      return { child1: [...parent1], child2: [...parent2] };
    }

    if (this.config.crossoverMethod === 'ORDER_ONE') {
      return {
        child1: this.orderOneCrossover(parent1, parent2),
        child2: this.orderOneCrossover(parent2, parent1),
      };
    } else if (this.config.crossoverMethod === 'PMX') {
      return {
        child1: this.pmxCrossover(parent1, parent2),
        child2: this.pmxCrossover(parent2, parent1),
      };
    } else {
      return {
        child1: this.cycleCrossover(parent1, parent2),
        child2: this.cycleCrossover(parent2, parent1),
      };
    }
  }

  private orderOneCrossover(p1: string[], p2: string[]): string[] {
    const size = p1.length;
    const child = Array(size).fill(null);

    const start = Math.floor(Math.random() * size);
    const end = Math.floor(Math.random() * size);
    const [lower, upper] = start < end ? [start, end] : [end, start];

    // Copy segment from p1
    for (let i = lower; i <= upper; i++) {
      child[i] = p1[i];
    }

    // Fill remaining from p2
    let childIdx = (upper + 1) % size;
    let p2Idx = (upper + 1) % size;

    while (child.includes(null)) {
      const candidate = p2[p2Idx];
      if (!child.includes(candidate)) {
        child[childIdx] = candidate;
        childIdx = (childIdx + 1) % size;
      }
      p2Idx = (p2Idx + 1) % size;
    }

    return child;
  }

  private pmxCrossover(p1: string[], p2: string[]): string[] {
    const size = p1.length;
    const child = Array(size).fill(null);

    const start = Math.floor(Math.random() * size);
    const end = Math.floor(Math.random() * size);
    const [lower, upper] = start < end ? [start, end] : [end, start];

    // Copy mapping segment
    for (let i = lower; i <= upper; i++) {
      child[i] = p1[i];
    }

    // Resolve mappings
    for (let i = lower; i <= upper; i++) {
      const candidate = p2[i];
      if (!child.includes(candidate)) {
        let valToPlace = candidate;
        let pos = i;
        while (pos >= lower && pos <= upper) {
          const mappedVal = p1[pos];
          pos = p2.indexOf(mappedVal);
        }
        child[pos] = valToPlace;
      }
    }

    // Fill remaining matching indices
    for (let i = 0; i < size; i++) {
      if (child[i] === null) {
        child[i] = p2[i];
      }
    }

    return child;
  }

  private cycleCrossover(p1: string[], p2: string[]): string[] {
    const size = p1.length;
    const child = Array(size).fill(null);

    let cycleStart = 0;
    while (child.includes(null)) {
      // Find first unvisited index
      while (cycleStart < size && child[cycleStart] !== null) {
        cycleStart++;
      }
      if (cycleStart >= size) break;

      let idx = cycleStart;
      const valStart = p1[idx];
      let valCurrent = p2[idx];

      child[idx] = valStart;

      while (valCurrent !== valStart) {
        idx = p1.indexOf(valCurrent);
        child[idx] = p1[idx];
        valCurrent = p2[idx];
      }
    }

    return child;
  }

  private mutate(chromosome: string[]): string[] {
    if (Math.random() > this.config.mutationRate) {
      return chromosome;
    }

    const mutated = [...chromosome];
    const size = mutated.length;

    if (this.config.mutationMethod === 'SWAP') {
      const i = Math.floor(Math.random() * size);
      const j = Math.floor(Math.random() * size);
      [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
    } else if (this.config.mutationMethod === 'INVERSION') {
      const i = Math.floor(Math.random() * size);
      const j = Math.floor(Math.random() * size);
      const [lower, upper] = i < j ? [i, j] : [j, i];
      const segment = mutated.slice(lower, upper + 1).reverse();
      mutated.splice(lower, segment.length, ...segment);
    } else {
      // SCRAMBLE
      const i = Math.floor(Math.random() * size);
      const j = Math.floor(Math.random() * size);
      const [lower, upper] = i < j ? [i, j] : [j, i];
      const segment = mutated.slice(lower, upper + 1);
      this.shuffleArray(segment);
      mutated.splice(lower, segment.length, ...segment);
    }

    return mutated;
  }

  public run(): { route: string[]; distance: number; history: GARunSummary[] } {
    this.history = [];
    let bestOverallChromosome: string[] = [];
    let bestOverallDistance = Infinity;

    for (let gen = 1; gen <= this.config.generations; gen++) {
      this.evaluatePopulation();

      // Find generation metrics
      let bestGenIdx = 0;
      let bestGenFitness = -Infinity;
      let totalDistance = 0;

      for (let i = 0; i < this.population.length; i++) {
        const fit = this.fitnessScores[i];
        const dist = this.calculateDistance(this.population[i]);
        totalDistance += dist;

        if (fit > bestGenFitness) {
          bestGenFitness = fit;
          bestGenIdx = i;
        }
      }

      const bestGenDistance = this.calculateDistance(this.population[bestGenIdx]);
      if (bestGenDistance < bestOverallDistance) {
        bestOverallDistance = bestGenDistance;
        bestOverallChromosome = [...this.population[bestGenIdx]];
      }

      this.history.push({
        generation: gen,
        bestFitness: bestGenFitness,
        bestDistance: bestGenDistance,
        averageDistance: totalDistance / this.population.length,
      });

      // Spawn next generation
      const nextPop: string[][] = [];

      // Carry over elites
      const sortedIndices = this.fitnessScores
        .map((score, index) => ({ score, index }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.index);

      for (let i = 0; i < Math.min(this.config.elitismCount, this.population.length); i++) {
        nextPop.push([...this.population[sortedIndices[i]]]);
      }

      // Repopulate remaining slots
      while (nextPop.length < this.config.populationSize) {
        const p1 = this.selectParent();
        const p2 = this.selectParent();
        const { child1, child2 } = this.crossover(p1, p2);
        nextPop.push(this.mutate(child1));
        if (nextPop.length < this.config.populationSize) {
          nextPop.push(this.mutate(child2));
        }
      }

      this.population = nextPop;
    }

    const finalRoute = [this.startAreaId, ...bestOverallChromosome, this.startAreaId];
    return {
      route: finalRoute,
      distance: bestOverallDistance,
      history: this.history,
    };
  }
}
