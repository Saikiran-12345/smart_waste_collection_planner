export interface HoltWintersConfig {
  alpha: number; // Level smoothing factor
  beta: number;  // Trend smoothing factor
  gamma: number; // Seasonal smoothing factor
  seasonalPeriod: number; // Number of periods in a season (e.g. 7 for weekly pattern)
}

export class TimeSeriesForecasting {
  /**
   * Double Exponential Smoothing (Holt's Linear Trend)
   * Suitable for data with a trend but no seasonal component.
   */
  public static doubleExponentialSmoothing(
    data: number[],
    steps: number,
    alpha: number = 0.2,
    beta: number = 0.1
  ): { forecast: number[]; level: number[]; trend: number[] } {
    if (data.length < 2) {
      throw new Error('Double Exponential Smoothing requires at least two data points.');
    }

    const n = data.length;
    const level = Array(n).fill(0);
    const trend = Array(n).fill(0);

    // Initializations
    level[0] = data[0];
    trend[0] = data[1] - data[0];

    for (let i = 1; i < n; i++) {
      level[i] = alpha * data[i] + (1 - alpha) * (level[i - 1] + trend[i - 1]);
      trend[i] = beta * (level[i] - level[i - 1]) + (1 - beta) * trend[i - 1];
    }

    const forecast = [];
    const lastLevel = level[n - 1];
    const lastTrend = trend[n - 1];

    for (let m = 1; m <= steps; m++) {
      forecast.push(Math.round(lastLevel + m * lastTrend));
    }

    return { forecast, level, trend };
  }

  /**
   * Triple Exponential Smoothing (Holt-Winters Additive Seasonality)
   * Suitable for data with both trend and seasonal component.
   */
  public static tripleExponentialSmoothing(
    data: number[],
    steps: number,
    config: HoltWintersConfig
  ): { forecast: number[]; level: number[]; trend: number[]; seasonal: number[] } {
    const { alpha, beta, gamma, seasonalPeriod: L } = config;
    const n = data.length;

    if (n < 2 * L) {
      throw new Error(`Holt-Winters requires at least two full seasons of data (got ${n} points, season period ${L}).`);
    }

    const level = Array(n).fill(0);
    const trend = Array(n).fill(0);
    const seasonal = Array(n + L).fill(0); // Padded for future offsets

    // 1. Initial Seasonality Factors
    const numSeasons = Math.floor(n / L);
    const seasonAverages = Array(numSeasons).fill(0);

    for (let s = 0; s < numSeasons; s++) {
      let sum = 0;
      for (let i = 0; i < L; i++) {
        sum += data[s * L + i];
      }
      seasonAverages[s] = sum / L;
    }

    for (let i = 0; i < L; i++) {
      let sumOverSeasons = 0;
      for (let s = 0; s < numSeasons; s++) {
        sumOverSeasons += data[s * L + i] - seasonAverages[s];
      }
      seasonal[i] = sumOverSeasons / numSeasons;
    }

    // 2. Initial Level and Trend
    level[L - 1] = data[L - 1] - seasonal[L - 1];
    let trendSum = 0;
    for (let i = 0; i < L; i++) {
      trendSum += (data[L + i] - data[i]) / L;
    }
    trend[L - 1] = trendSum / L;

    // 3. Process time-series
    for (let i = L; i < n; i++) {
      level[i] = alpha * (data[i] - seasonal[i - L]) + (1 - alpha) * (level[i - 1] + trend[i - 1]);
      trend[i] = beta * (level[i] - level[i - 1]) + (1 - beta) * trend[i - 1];
      seasonal[i] = gamma * (data[i] - level[i]) + (1 - gamma) * seasonal[i - L];
    }

    // 4. Forecast future steps
    const forecast: number[] = [];
    for (let m = 1; m <= steps; m++) {
      const idx = n - 1;
      const forecastVal = level[idx] + m * trend[idx] + seasonal[idx + m - L - L * Math.floor((m - 1) / L)];
      forecast.push(Math.round(forecastVal));
    }

    return { forecast, level, trend, seasonal: seasonal.slice(0, n) };
  }
}
export default TimeSeriesForecasting;
