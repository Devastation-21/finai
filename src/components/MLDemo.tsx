"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Play, 
  BarChart3,
  TrendingUp,
  Calculator,
  CheckCircle
} from "lucide-react";
import { 
  MovingAverageModel, 
  LinearRegressionModel, 
  ExponentialSmoothingModel,
  EnsembleModel 
} from "@/lib/ml-predictions";

export function MLDemo() {
  const [demoData, setDemoData] = useState<number[]>([25000, 30000, 35000, 32000, 38000, 40000, 36000, 42000]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runMLDemo = async () => {
    setIsRunning(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Initialize models
    const movingAvg = new MovingAverageModel();
    const linearReg = new LinearRegressionModel();
    const expSmooth = new ExponentialSmoothingModel();
    const ensemble = new EnsembleModel([movingAvg, linearReg, expSmooth]);
    
    // Generate predictions
    const results = [
      {
        model: "Moving Average",
        prediction: movingAvg.predict(demoData),
        confidence: movingAvg.confidence(demoData),
        description: "Averages the last 3 values"
      },
      {
        model: "Linear Regression",
        prediction: linearReg.predict(demoData),
        confidence: linearReg.confidence(demoData),
        description: "Fits a straight line through all data points"
      },
      {
        model: "Exponential Smoothing",
        prediction: expSmooth.predict(demoData),
        confidence: expSmooth.confidence(demoData),
        description: "Gives more weight to recent values"
      },
      {
        model: "Ensemble",
        prediction: ensemble.predict(demoData),
        confidence: ensemble.confidence(demoData),
        description: "Combines all models for better accuracy"
      }
    ];
    
    setPredictions(results);
    setIsRunning(false);
  };

  const addRandomData = () => {
    const newValue = Math.floor(Math.random() * 20000) + 20000; // 20k-40k range
    setDemoData([...demoData, newValue]);
    setPredictions([]);
  };

  const resetData = () => {
    setDemoData([25000, 30000, 35000, 32000, 38000, 40000, 36000, 42000]);
    setPredictions([]);
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            ML Algorithm Demo
          </CardTitle>
          <CardDescription>
            See how different machine learning algorithms work with your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Data Visualization */}
            <div>
              <h4 className="font-semibold mb-3">Historical Data (Monthly Spending)</h4>
              <div className="flex items-end gap-2 h-32 border-b border-l p-4">
                {demoData.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div 
                      className="bg-blue-500 w-8 rounded-t"
                      style={{ height: `${(value / Math.max(...demoData)) * 100}px` }}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {value.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      M{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button onClick={runMLDemo} disabled={isRunning} className="gap-2">
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Running ML Models...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run ML Predictions
                  </>
                )}
              </Button>
              <Button onClick={addRandomData} variant="outline">
                Add Random Data
              </Button>
              <Button onClick={resetData} variant="outline">
                Reset Data
              </Button>
            </div>

            {/* Predictions */}
            {predictions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">ML Predictions for Next Month</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictions.map((pred, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold">{pred.model}</h5>
                            <Badge variant="outline">
                              {pred.confidence.toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            ₹{pred.prediction.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pred.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Algorithm Explanation */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                How These Algorithms Work
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-1">Moving Average</h5>
                  <p className="text-muted-foreground">
                    Takes the average of the last 3 values. Simple but effective for stable trends.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Linear Regression</h5>
                  <p className="text-muted-foreground">
                    Finds the best straight line through all data points. Good for consistent growth/decline.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Exponential Smoothing</h5>
                  <p className="text-muted-foreground">
                    Gives more weight to recent data. Adapts quickly to changes in patterns.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Ensemble</h5>
                  <p className="text-muted-foreground">
                    Combines multiple models. Usually more accurate than individual models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

