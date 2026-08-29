export type ActivationFunctionType = 'SIGMOID' | 'RELU' | 'TANH';

export interface NetworkConfig {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  learningRate: number;
  activation: ActivationFunctionType;
  epochs: number;
}

export interface TrainingSample {
  inputs: number[];
  targets: number[];
}

export class NeuralNetworkForecaster {
  private config: NetworkConfig;
  private weights: number[][][] = []; // Weights matrix for each layer connection
  private biases: number[][] = [];   // Biases matrix for each layer neurons
  private neuronValues: number[][] = []; // Output value of each neuron after activation
  private rawNeuronInputs: number[][] = []; // Raw input sum for each neuron before activation

  constructor(config: Partial<NetworkConfig> = {}) {
    this.config = {
      inputSize: config.inputSize ?? 5,
      hiddenLayers: config.hiddenLayers ?? [8, 4],
      outputSize: config.outputSize ?? 1,
      learningRate: config.learningRate ?? 0.05,
      activation: config.activation ?? 'RELU',
      epochs: config.epochs ?? 500,
    };
    this.initializeWeights();
  }

  private initializeWeights(): void {
    const layers = [
      this.config.inputSize,
      ...this.config.hiddenLayers,
      this.config.outputSize,
    ];

    this.weights = [];
    this.biases = [];

    for (let l = 0; l < layers.length - 1; l++) {
      const inputs = layers[l];
      const outputs = layers[l + 1];

      // Xavier/He Weight Initialization
      const variance = this.config.activation === 'RELU' ? 2.0 / inputs : 1.0 / inputs;
      const stdDev = Math.sqrt(variance);

      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      for (let o = 0; o < outputs; o++) {
        const neuronWeights: number[] = [];
        for (let i = 0; i < inputs; i++) {
          // Standard Normal Distribution Box-Muller transform
          const u1 = Math.random() || 0.0001;
          const u2 = Math.random() || 0.0001;
          const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          neuronWeights.push(randStdNormal * stdDev);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push(0.01); // Initial small bias
      }
      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  private activate(x: number): number {
    if (this.config.activation === 'SIGMOID') {
      return 1.0 / (1.0 + Math.exp(-x));
    } else if (this.config.activation === 'TANH') {
      return Math.tanh(x);
    } else {
      // RELU
      return Math.max(0.01 * x, x); // Leaky ReLU to avoid dying neurons
    }
  }

  private activationDerivative(activatedVal: number): number {
    if (this.config.activation === 'SIGMOID') {
      return activatedVal * (1.0 - activatedVal);
    } else if (this.config.activation === 'TANH') {
      return 1.0 - activatedVal * activatedVal;
    } else {
      // Leaky RELU derivative
      return activatedVal > 0 ? 1.0 : 0.01;
    }
  }

  public feedForward(inputs: number[]): number[] {
    if (inputs.length !== this.config.inputSize) {
      throw new Error(`Invalid neural input dimensions: expected ${this.config.inputSize}, got ${inputs.length}`);
    }

    this.neuronValues = [[...inputs]];
    this.rawNeuronInputs = [[]]; // Placeholder for input layer

    let current = [...inputs];

    for (let l = 0; l < this.weights.length; l++) {
      const next: number[] = [];
      const rawSums: number[] = [];
      const layerWeights = this.weights[l];
      const layerBiases = this.biases[l];

      for (let o = 0; o < layerWeights.length; o++) {
        const weights = layerWeights[o];
        const bias = layerBiases[o];

        let sum = bias;
        for (let i = 0; i < weights.length; i++) {
          sum += current[i] * weights[i];
        }
        rawSums.push(sum);
        next.push(this.activate(sum));
      }
      this.rawNeuronInputs.push(rawSums);
      this.neuronValues.push(next);
      current = next;
    }

    return current;
  }

  public backpropagate(targets: number[]): number {
    if (targets.length !== this.config.outputSize) {
      throw new Error(`Invalid neural output targets dimension: expected ${this.config.outputSize}`);
    }

    const L = this.neuronValues.length - 1; // Last layer index
    const outputLayerVals = this.neuronValues[L];
    const errors: number[][] = [];

    // Initialize errors placeholder structure
    for (let l = 0; l <= L; l++) {
      errors.push(Array(this.neuronValues[l].length).fill(0));
    }

    // 1. Calculate output layer error delta
    let totalSqrError = 0;
    for (let o = 0; o < this.config.outputSize; o++) {
      const difference = targets[o] - outputLayerVals[o];
      totalSqrError += difference * difference;
      // error delta = difference * f'(raw input)
      errors[L][o] = difference * this.activationDerivative(outputLayerVals[o]);
    }

    // 2. Propagate error back through hidden layers
    for (let l = L - 1; l > 0; l--) {
      const currentVals = this.neuronValues[l];
      const nextWeights = this.weights[l]; // Weights mapping layer l -> l+1
      const nextErrors = errors[l + 1];

      for (let i = 0; i < currentVals.length; i++) {
        let weightedSum = 0;
        for (let o = 0; o < nextWeights.length; o++) {
          weightedSum += nextErrors[o] * nextWeights[o][i];
        }
        errors[l][i] = weightedSum * this.activationDerivative(currentVals[i]);
      }
    }

    // 3. Update weights and biases using calculated gradients
    for (let l = 0; l < this.weights.length; l++) {
      const layerWeights = this.weights[l];
      const layerBiases = this.biases[l];
      const prevVals = this.neuronValues[l];
      const layerErrors = errors[l + 1];

      for (let o = 0; o < layerWeights.length; o++) {
        const weights = layerWeights[o];
        const err = layerErrors[o];

        for (let i = 0; i < weights.length; i++) {
          // Weight update = learningRate * errorDelta * inputActivation
          weights[i] += this.config.learningRate * err * prevVals[i];
        }
        // Bias update = learningRate * errorDelta
        layerBiases[o] += this.config.learningRate * err;
      }
    }

    return totalSqrError / 2.0; // Mean Squared Error component
  }

  public train(samples: TrainingSample[]): number[] {
    const errorHistory: number[] = [];

    for (let epoch = 0; epoch < this.config.epochs; epoch++) {
      let epochSumError = 0;
      for (const sample of samples) {
        this.feedForward(sample.inputs);
        const err = this.backpropagate(sample.targets);
        epochSumError += err;
      }
      errorHistory.push(epochSumError / samples.length);
    }

    return errorHistory;
  }
}
