"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Target
} from "lucide-react";
import { generateMLPredictions } from "@/lib/ml-predictions";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/currency";

interface SimpleMLPredictionsProps {
  transactions: Transaction[];
  financialMetrics: any;
}

export function SimpleMLPredictions({ transactions, financialMetrics }: SimpleMLPredictionsProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePredictions = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mlPredictions = generateMLPredictions(transactions);
      setPredictions(mlPredictions);
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

  if (transactions.length === 0) {
    return null;
  }

  // Filter to show only the most important predictions and make them user-friendly
  const mainPredictions = predictions.filter(p => 
    p.type === 'spending' && 
    (p.timeframe.includes('30 days') || p.timeframe.includes('3 months'))
  ).slice(0, 3).map(prediction => ({
    ...prediction,
    // Make timeframe more user-friendly
    timeframe: prediction.timeframe.includes('30 days') ? 'Next Month' : 'Next 3 Months',
    // Simplify method names
    method: prediction.method.includes('Ensemble') ? 'Smart Prediction' :
            prediction.method.includes('Linear') ? 'Trend Analysis' :
            prediction.method.includes('Moving') ? 'Average Pattern' :
            'AI Analysis'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Future Spending Forecast
        </CardTitle>
        <CardDescription>
          Predictions based on your spending history to help you plan ahead
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Calculating your spending forecast...</span>
              </div>
            </div>
        ) : predictions.length > 0 ? (
          <div className="space-y-4">
            {/* Helpful explanation */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>How it works:</strong> We analyze your spending patterns to predict how much you might spend in the future. 
                This helps you plan your budget and avoid overspending.
              </p>
            </div>
            
            {mainPredictions.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {prediction.timeframe.includes('30 days') ? (
                      <Calendar className="h-4 w-4 text-primary" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {prediction.timeframe}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prediction.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatCurrency(prediction.value)}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      prediction.confidence >= 70 ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' :
                      prediction.confidence >= 50 ? 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                      'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}
                  >
                    {prediction.confidence >= 70 ? 'High' :
                     prediction.confidence >= 50 ? 'Medium' : 'Low'} accuracy
                  </Badge>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span>Based on your {transactions.length} recent transactions</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generatePredictions}
                  disabled={isGenerating}
                >
                  Update Forecast
                </Button>
              </div>
              
              {/* Helpful tips */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>💡 Tips for better predictions:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• More transaction history = more accurate forecasts</li>
                  <li>• Regular spending patterns are easier to predict</li>
                  <li>• Use these forecasts to set realistic budgets</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Add more transactions to get spending forecasts</p>
            <p className="text-xs mt-1">We need at least 3 months of data for accurate predictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
