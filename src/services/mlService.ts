import modelData from '../ml/model.json';
import { readOne } from '../repository/repository';
import type { Area } from '../types/Area';

/**
 * Service for predicting future waste volumes.
 * Uses a linear regression model stored in model.json.
 */
export const mlService = {
  /**
   * Forecast waste generation (in kilograms) for a given area.
   * Formula: Forecast = Intercept + (Population * PopulationWeight) * AreaFactor
   */
  async forecastWasteForArea(areaId: string): Promise<{
    areaId: string;
    forecastValue: number;
    explanation: string;
  }> {
    const area = await readOne('Area', areaId) as Area | null;
    if (!area) {
      throw new Error(`Area not found: ${areaId}`);
    }

    const { coefficients } = modelData;
    const populationWeight = coefficients.population_weight;
    const intercept = coefficients.intercept;
    // Get area-specific factor or default to 1.0
    const areaFactors = coefficients.area_factors as Record<string, number>;
    const areaFactor = areaFactors[areaId] || 1.0;

    const baseForecast = intercept + (area.populationEstimate * populationWeight);
    const finalForecast = baseForecast * areaFactor * coefficients.growth_factor;

    return {
      areaId,
      forecastValue: Math.round(finalForecast),
      explanation: `Forecast calculated using linear regression: (Base Intercept (${intercept}) + Population (${area.populationEstimate}) * Weight (${populationWeight})) * Area Factor (${areaFactor}) * Growth Factor (${coefficients.growth_factor})`,
    };
  },
};
