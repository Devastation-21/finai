"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react";
import { generateMLPredictions, compareModels, MLPrediction } from "@/lib/ml-predictions";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/currency";

interface MLPredictionsProps {
  transactions: Transaction[];
  financialMetrics: any;
}

export function MLPredictions({ transactions, financialMetrics }: MLPredictionsProps) {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [modelComparison, setModelComparison] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');

  const generatePredictions = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate processing time for ML calculations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mlPredictions = generateMLPredictions(transactions);
      setPredictions(mlPredictions);
      
      // Prepare data for model comparison
      const monthlyData = prepareMonthlyData(transactions);
      const spendingValues = monthlyData.map(m => m.total);
      
      if (spendingValues.length >= 3) {
        const comparison = compareModels(spendingValues);
        setModelComparison(comparison);
      }
    } catch (error) {
      console.error('Error generating ML predictions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      generatePredictions();
    }
  }, [transactions]);

  const filteredPredictions = selectedTimeframe === 'all' 
    ? predictions 
    : predictions.filter(p => p.timeframe.toLowerCase().includes(selectedTimeframe.toLowerCase()));

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'spending': return <DollarSign className="h-4 w-4" />;
      case 'savings': return <Target className="h-4 w-4" />;
      case 'category': return <BarChart3 className="h-4 w-4" />;
      case 'seasonal': return <Calendar className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100";
    if (confidence >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Machine Learning Predictions</h2>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
            Real ML Models
          </Badge>
        </div>
        <Button 
          onClick={generatePredictions}
          disabled={isGenerating || transactions.length === 0}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Training Models...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Generate Predictions
            </>
          )}
        </Button>
      </div>

      {/* Model Performance Comparison */}
      {modelComparison.length > 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Model Performance Comparison
            </CardTitle>
            <CardDescription>
              Accuracy metrics based on historical data validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modelComparison.map((model, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{model.model}</h4>
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      {index === 0 ? "Best" : `#${index + 1}`}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>MSE: {model.mse.toLocaleString()}</div>
                    <div>MAE: {model.mae.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeframe Filter */}
      <div className="flex gap-2">
        {['all', '30 days', '3 months', '12 months'].map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
          >
            {timeframe === 'all' ? 'All Timeframes' : timeframe}
          </Button>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPredictions.map((prediction, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {getPredictionIcon(prediction.type)}
                {prediction.type.charAt(0).toUpperCase() + prediction.type.slice(1)} Prediction
              </CardTitle>
              <CardDescription className="text-xs">
                {prediction.timeframe} • {prediction.method}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold">
                  {formatCurrency(prediction.value)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence</span>
                    <span className={`font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={prediction.confidence} 
                    className="h-2"
                  />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {prediction.description}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getConfidenceBg(prediction.confidence)}`}
                  >
                    {prediction.confidence >= 80 ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> High Confidence</>
                    ) : prediction.confidence >= 60 ? (
                      <><AlertTriangle className="h-3 w-3 mr-1" /> Medium Confidence</>
                    ) : (
                      <><AlertTriangle className="h-3 w-3 mr-1" /> Low Confidence</>
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ML Insights */}
      {predictions.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              ML Analysis Summary
            </CardTitle>
            <CardDescription>
              Insights from machine learning models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generateMLInsights(predictions, modelComparison).map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 border">
                  <div className="flex-shrink-0 mt-1">
                    {insight.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : insight.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Brain className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Technical Implementation
          </CardTitle>
          <CardDescription>
            Machine learning algorithms used in predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Algorithms Implemented:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Moving Average (MA)</li>
                <li>• Linear Regression (LR)</li>
                <li>• Exponential Smoothing (ES)</li>
                <li>• Seasonal Decomposition</li>
                <li>• Ensemble Methods</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Model Validation:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cross-validation with 20% test set</li>
                <li>• Mean Squared Error (MSE)</li>
                <li>• Mean Absolute Error (MAE)</li>
                <li>• R-squared for confidence scoring</li>
                <li>• Automatic model selection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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

function generateMLInsights(predictions: MLPrediction[], modelComparison: any[]) {
  const insights = [];
  
  // Model performance insights
  if (modelComparison.length > 0) {
    const bestModel = modelComparison[0];
    insights.push({
      type: 'success',
      title: 'Model Performance',
      description: `${bestModel.model} performed best with MSE of ${bestModel.mse.toLocaleString()} and MAE of ${bestModel.mae.toLocaleString()}.`
    });
  }
  
  // Prediction confidence insights
  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  if (avgConfidence >= 75) {
    insights.push({
      type: 'success',
      title: 'High Prediction Confidence',
      description: `Average confidence across all predictions is ${avgConfidence.toFixed(0)}%, indicating reliable forecasts.`
    });
  } else if (avgConfidence < 50) {
    insights.push({
      type: 'warning',
      title: 'Low Prediction Confidence',
      description: `Average confidence is ${avgConfidence.toFixed(0)}%. Consider adding more historical data for better predictions.`
    });
  }
  
  // Data quality insights
  const spendingPredictions = predictions.filter(p => p.type === 'spending');
  if (spendingPredictions.length > 0) {
    const avgSpending = spendingPredictions.reduce((sum, p) => sum + p.value, 0) / spendingPredictions.length;
    insights.push({
      type: 'info',
      title: 'Spending Forecast',
      description: `ML models predict average monthly spending of ${formatCurrency(avgSpending)} across different timeframes.`
    });
  }
  
  return insights;
}

