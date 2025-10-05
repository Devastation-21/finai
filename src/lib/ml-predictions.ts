// Real Machine Learning algorithms for financial predictions
import { Transaction } from "@/types";

export interface MLPrediction {
  type: 'spending' | 'savings' | 'category' | 'seasonal';
  value: number;
  confidence: number;
  timeframe: string;
  method: string;
  description: string;
}

export interface MLModel {
  name: string;
  predict: (data: number[]) => number;
  confidence: (data: number[]) => number;
}

// 1. Moving Average Model
export class MovingAverageModel implements MLModel {
  name = "Moving Average";
  
  predict(data: number[]): number {
    if (data.length === 0) return 0;
    if (data.length < 3) return data[data.length - 1] || 0;
    
    // Use last 3 values for moving average
    const recent = data.slice(-3);
    return recent.reduce((sum, val) => sum + val, 0) / recent.length;
  }
  
  confidence(data: number[]): number {
    if (data.length < 3) return 30;
    if (data.length < 6) return 50;
    return 70;
  }
}

// 2. Linear Regression Model
export class LinearRegressionModel implements MLModel {
  name = "Linear Regression";
  
  predict(data: number[]): number {
    if (data.length < 2) return data[0] || 0;
    
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    // Calculate slope and intercept
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next value
    return slope * n + intercept;
  }
  
  confidence(data: number[]): number {
    if (data.length < 3) return 40;
    if (data.length < 6) return 60;
    
    // Calculate R-squared for confidence
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    
    const rSquared = 1 - (ssRes / ssTot);
    return Math.max(30, Math.min(90, rSquared * 100));
  }
}

// 3. Exponential Smoothing Model
export class ExponentialSmoothingModel implements MLModel {
  name = "Exponential Smoothing";
  
  predict(data: number[]): number {
    if (data.length === 0) return 0;
    if (data.length === 1) return data[0];
    
    const alpha = 0.3; // Smoothing factor
    let smoothed = data[0];
    
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }
    
    return smoothed;
  }
  
  confidence(data: number[]): number {
    if (data.length < 3) return 40;
    if (data.length < 6) return 60;
    return 75;
  }
}

// 4. Seasonal Decomposition Model
export class SeasonalModel implements MLModel {
  name = "Seasonal Analysis";
  
  predict(data: number[]): number {
    if (data.length < 12) return data[data.length - 1] || 0;
    
    // Calculate seasonal patterns (assuming monthly data)
    const monthlyData = this.groupByMonth(data);
    const seasonalFactors = this.calculateSeasonalFactors(monthlyData);
    
    // Get current month
    const currentMonth = new Date().getMonth();
    const seasonalFactor = seasonalFactors[currentMonth] || 1;
    
    // Calculate trend
    const trend = this.calculateTrend(data);
    
    return trend * seasonalFactor;
  }
  
  confidence(data: number[]): number {
    if (data.length < 12) return 30;
    if (data.length < 24) return 50;
    return 70;
  }
  
  private groupByMonth(data: number[]): { [month: number]: number[] } {
    // This is simplified - in reality you'd group by actual month
    const monthlyData: { [month: number]: number[] } = {};
    
    data.forEach((value, index) => {
      const month = index % 12;
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(value);
    });
    
    return monthlyData;
  }
  
  private calculateSeasonalFactors(monthlyData: { [month: number]: number[] }): number[] {
    const factors = new Array(12).fill(1);
    
    // Calculate average for each month
    Object.entries(monthlyData).forEach(([month, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      factors[parseInt(month)] = avg;
    });
    
    // Normalize factors
    const overallAvg = factors.reduce((sum, factor) => sum + factor, 0) / 12;
    return factors.map(factor => factor / overallAvg);
  }
  
  private calculateTrend(data: number[]): number {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return slope * n + intercept;
  }
}

// 5. Ensemble Model (combines multiple models)
export class EnsembleModel implements MLModel {
  name = "Ensemble";
  private models: MLModel[];
  
  constructor(models: MLModel[]) {
    this.models = models;
  }
  
  predict(data: number[]): number {
    const predictions = this.models.map(model => model.predict(data));
    return predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
  }
  
  confidence(data: number[]): number {
    const confidences = this.models.map(model => model.confidence(data));
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }
}

// Main prediction function
export function generateMLPredictions(transactions: Transaction[]): MLPrediction[] {
  if (!transactions.length) return [];
  
  // Prepare data
  const monthlySpending = prepareMonthlyData(transactions);
  const spendingValues = monthlySpending.map(m => m.total);
  
  if (spendingValues.length < 2) return [];
  
  // Initialize models
  const movingAvg = new MovingAverageModel();
  const linearReg = new LinearRegressionModel();
  const expSmooth = new ExponentialSmoothingModel();
  const seasonal = new SeasonalModel();
  const ensemble = new EnsembleModel([movingAvg, linearReg, expSmooth]);
  
  // Generate predictions
  const predictions: MLPrediction[] = [];
  
  // 1. Next Month Spending Prediction
  const nextMonthSpending = ensemble.predict(spendingValues);
  const spendingConfidence = ensemble.confidence(spendingValues);
  
  predictions.push({
    type: 'spending',
    value: Math.max(0, nextMonthSpending),
    confidence: spendingConfidence,
    timeframe: 'Next 30 days',
    method: 'Ensemble (MA + LR + ES)',
    description: `Combined prediction from ${spendingValues.length} months of data`
  });
  
  // 2. 3-Month Spending Trend
  const threeMonthPrediction = linearReg.predict(spendingValues);
  const threeMonthConfidence = linearReg.confidence(spendingValues);
  
  predictions.push({
    type: 'spending',
    value: Math.max(0, threeMonthPrediction),
    confidence: threeMonthConfidence,
    timeframe: 'Next 3 months',
    method: 'Linear Regression',
    description: `Trend-based projection with ${threeMonthConfidence.toFixed(0)}% confidence`
  });
  
  // 3. Seasonal Spending Pattern
  if (spendingValues.length >= 12) {
    const seasonalPrediction = seasonal.predict(spendingValues);
    const seasonalConfidence = seasonal.confidence(spendingValues);
    
    predictions.push({
      type: 'seasonal',
      value: Math.max(0, seasonalPrediction),
      confidence: seasonalConfidence,
      timeframe: 'Next 12 months',
      method: 'Seasonal Decomposition',
      description: `Accounts for seasonal spending patterns`
    });
  }
  
  // 4. Category-wise Predictions
  const categoryPredictions = generateCategoryPredictions(transactions);
  predictions.push(...categoryPredictions);
  
  return predictions;
}

function prepareMonthlyData(transactions: Transaction[]) {
  const monthlyData: { [key: string]: { total: number; count: number } } = {};
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 };
      }
      
      monthlyData[monthKey].total += transaction.amount;
      monthlyData[monthKey].count += 1;
    }
  });
  
  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, total: data.total, count: data.count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function generateCategoryPredictions(transactions: Transaction[]): MLPrediction[] {
  const categoryData: { [category: string]: number[] } = {};
  
  // Group transactions by category
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      if (!categoryData[transaction.category]) {
        categoryData[transaction.category] = [];
      }
      categoryData[transaction.category].push(transaction.amount);
    }
  });
  
  const predictions: MLPrediction[] = [];
  const movingAvg = new MovingAverageModel();
  
  Object.entries(categoryData).forEach(([category, amounts]) => {
    if (amounts.length >= 3) {
      const prediction = movingAvg.predict(amounts);
      const confidence = movingAvg.confidence(amounts);
      
      predictions.push({
        type: 'category',
        value: Math.max(0, prediction),
        confidence,
        timeframe: 'Next month',
        method: 'Moving Average',
        description: `Predicted spending in ${category} category`
      });
    }
  });
  
  return predictions;
}

// Model comparison function
export function compareModels(data: number[]): { model: string; mse: number; mae: number }[] {
  const models = [
    new MovingAverageModel(),
    new LinearRegressionModel(),
    new ExponentialSmoothingModel(),
    new SeasonalModel()
  ];
  
  const results: { model: string; mse: number; mae: number }[] = [];
  
  models.forEach(model => {
    if (data.length < 3) return;
    
    // Use last 20% of data for testing
    const testSize = Math.max(1, Math.floor(data.length * 0.2));
    const trainData = data.slice(0, -testSize);
    const testData = data.slice(-testSize);
    
    let mse = 0;
    let mae = 0;
    
    for (let i = 0; i < testData.length; i++) {
      const prediction = model.predict(trainData.slice(0, trainData.length - testData.length + i));
      const actual = testData[i];
      
      const error = prediction - actual;
      mse += error * error;
      mae += Math.abs(error);
    }
    
    mse /= testData.length;
    mae /= testData.length;
    
    results.push({
      model: model.name,
      mse: Math.round(mse),
      mae: Math.round(mae)
    });
  });
  
  return results.sort((a, b) => a.mse - b.mse);
}

