"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Lightbulb
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Transaction } from "@/types";

interface AIPredictionsProps {
  transactions: Transaction[];
  financialMetrics: any;
}

interface AIPrediction {
  id: string;
  title: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  category: 'spending' | 'savings' | 'investment' | 'risk';
  actionable: boolean;
  action?: string;
  icon: React.ReactNode;
  color: string;
}

export function AIPredictions({ transactions, financialMetrics }: AIPredictionsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [isGenerating, setIsGenerating] = useState(false);

  const predictions = generateAIPredictions(transactions, financialMetrics, selectedTimeframe);

  const handleGeneratePredictions = async () => {
    setIsGenerating(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Advanced Financial Analysis</h2>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
            Statistical Models
          </Badge>
        </div>
        <Button 
          onClick={handleGeneratePredictions}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Generate Predictions
            </>
          )}
        </Button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {[
          { key: '1m', label: '1 Month', icon: <Calendar className="h-4 w-4" /> },
          { key: '3m', label: '3 Months', icon: <Calendar className="h-4 w-4" /> },
          { key: '6m', label: '6 Months', icon: <Calendar className="h-4 w-4" /> },
          { key: '1y', label: '1 Year', icon: <Calendar className="h-4 w-4" /> }
        ].map((timeframe) => (
          <Button
            key={timeframe.key}
            variant={selectedTimeframe === timeframe.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe.key as any)}
            className="gap-2"
          >
            {timeframe.icon}
            {timeframe.label}
          </Button>
        ))}
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((prediction) => (
          <Card key={prediction.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${prediction.color}`}>
                    {prediction.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{prediction.title}</CardTitle>
                    <CardDescription className="text-sm">{prediction.timeframe}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={prediction.impact === 'high' ? 'destructive' : prediction.impact === 'medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {prediction.impact.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {prediction.prediction}
                  </p>
                  {prediction.actionable && prediction.action && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-amber-700">Recommended Action:</p>
                          <p className="text-xs text-amber-600 mt-1">{prediction.action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>AI Confidence</span>
                    <span>{prediction.confidence}%</span>
                  </div>
                  <Progress 
                    value={prediction.confidence} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights Summary */}
      <Card className="border-dashed bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Statistical Analysis Summary
          </CardTitle>
          <CardDescription>
            Based on statistical analysis of your financial patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generateAISummary(transactions, financialMetrics, selectedTimeframe).map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-white/50 border">
                <div className="flex-shrink-0 mt-1">
                  {insight.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : insight.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  {insight.recommendation && (
                    <div className="mt-2 p-2 bg-white/70 rounded text-xs">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateAIPredictions(transactions: Transaction[], financialMetrics: any, timeframe: string): AIPrediction[] {
  if (!transactions.length || !financialMetrics) {
    return [];
  }

  const predictions: AIPrediction[] = [];
  
  // Calculate spending patterns
  const recentSpending = calculateRecentSpending(transactions, 30);
  const avgMonthlySpending = recentSpending / 30 * 30;
  
  // Predict future spending based on trends
  const spendingTrend = calculateSpendingTrend(transactions);
  const projectedSpending = avgMonthlySpending * (1 + spendingTrend * 0.1);
  
  // Timeframe multiplier
  const timeframeMultiplier = {
    '1m': 1,
    '3m': 3,
    '6m': 6,
    '1y': 12
  }[timeframe];

  // Spending Prediction
  predictions.push({
    id: 'spending-forecast',
    title: 'Spending Forecast',
    prediction: `Based on your spending patterns, you're likely to spend approximately ${formatCurrency(projectedSpending * timeframeMultiplier)} over the next ${timeframe === '1m' ? 'month' : timeframe === '3m' ? '3 months' : timeframe === '6m' ? '6 months' : 'year'}. This represents a ${spendingTrend > 0 ? 'increase' : 'decrease'} of ${Math.abs(spendingTrend * 100).toFixed(1)}% from your current rate.`,
    confidence: Math.min(85, 60 + (transactions.length * 1.5)),
    timeframe: `${timeframe.toUpperCase()} Forecast`,
    impact: projectedSpending > avgMonthlySpending * 1.2 ? 'high' : 'medium',
    category: 'spending',
    actionable: true,
    action: spendingTrend > 0.1 ? 'Consider reviewing your budget and cutting unnecessary expenses' : 'Your spending is well-controlled, consider increasing savings',
    icon: <DollarSign className="h-4 w-4" />,
    color: spendingTrend > 0.1 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
  });

  // Savings Prediction
  const currentSavings = financialMetrics.savings || 0;
  const monthlySavings = financialMetrics.totalIncome - financialMetrics.totalExpenses;
  const projectedSavings = currentSavings + (monthlySavings * timeframeMultiplier);
  
  predictions.push({
    id: 'savings-projection',
    title: 'Savings Projection',
    prediction: `If you maintain your current savings rate, you'll have approximately ${formatCurrency(projectedSavings)} saved by the end of the ${timeframe === '1m' ? 'month' : timeframe === '3m' ? '3 months' : timeframe === '6m' ? '6 months' : 'year'}. This represents a ${monthlySavings > 0 ? 'positive' : 'negative'} savings trajectory.`,
    confidence: monthlySavings > 0 ? 75 : 45,
    timeframe: `${timeframe.toUpperCase()} Projection`,
    impact: monthlySavings > 0 ? 'medium' : 'high',
    category: 'savings',
    actionable: true,
    action: monthlySavings > 0 ? 'Consider increasing your savings rate by 5-10%' : 'Focus on reducing expenses or increasing income to achieve positive savings',
    icon: <Target className="h-4 w-4" />,
    color: monthlySavings > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
  });

  // Risk Assessment
  const riskLevel = assessFinancialRisk(transactions, financialMetrics);
  
  predictions.push({
    id: 'risk-assessment',
    title: 'Financial Risk Assessment',
    prediction: `Your current financial risk level is ${riskLevel.level}. ${riskLevel.description} This assessment is based on your spending volatility, savings rate, and income stability.`,
    confidence: 80,
    timeframe: 'Current Assessment',
    impact: riskLevel.level === 'High' ? 'high' : riskLevel.level === 'Medium' ? 'medium' : 'low',
    category: 'risk',
    actionable: true,
    action: riskLevel.recommendation,
    icon: <AlertTriangle className="h-4 w-4" />,
    color: riskLevel.level === 'High' ? 'bg-red-100 text-red-600' : riskLevel.level === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
  });

  // Investment Opportunity
  if (monthlySavings > 5000) {
    predictions.push({
      id: 'investment-opportunity',
      title: 'Investment Opportunity',
      prediction: `With your current savings rate of ${formatCurrency(monthlySavings)} per month, you have a strong opportunity to build wealth through investments. Consider allocating 70% to low-risk investments and 30% to growth opportunities.`,
      confidence: 70,
      timeframe: 'Long-term',
      impact: 'medium',
      category: 'investment',
      actionable: true,
      action: 'Consult with a financial advisor about investment options suitable for your risk tolerance',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-600'
    });
  }

  return predictions;
}

function calculateRecentSpending(transactions: Transaction[], days: number): number {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= cutoffDate)
    .reduce((sum, t) => sum + t.amount, 0);
}

function calculateSpendingTrend(transactions: Transaction[]): number {
  const monthlyData = calculateMonthlySpending(transactions);
  if (monthlyData.length < 2) return 0;
  
  const values = monthlyData.map(m => m.total);
  return calculateTrend(values);
}

function calculateMonthlySpending(transactions: Transaction[]) {
  const monthlyData: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
    }
  });

  return Object.entries(monthlyData).map(([month, total]) => ({
    month,
    total
  })).sort((a, b) => a.month.localeCompare(b.month));
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
}

function assessFinancialRisk(transactions: Transaction[], financialMetrics: any) {
  const recentSpending = calculateRecentSpending(transactions, 30);
  const avgMonthlySpending = recentSpending;
  const monthlyIncome = financialMetrics.totalIncome || 0;
  const savingsRate = financialMetrics.savingsRate || 0;
  
  let riskScore = 0;
  
  // Spending volatility
  const spendingVolatility = calculateSpendingVolatility(transactions);
  if (spendingVolatility > 0.3) riskScore += 3;
  else if (spendingVolatility > 0.2) riskScore += 2;
  else if (spendingVolatility > 0.1) riskScore += 1;
  
  // Savings rate
  if (savingsRate < 5) riskScore += 3;
  else if (savingsRate < 10) riskScore += 2;
  else if (savingsRate < 20) riskScore += 1;
  
  // Income stability (simplified)
  const incomeStability = monthlyIncome > 0 ? 1 : 0;
  riskScore += (1 - incomeStability) * 2;
  
  if (riskScore >= 6) {
    return {
      level: 'High',
      description: 'Your financial situation shows high volatility and low savings, which could lead to financial stress.',
      recommendation: 'Focus on building an emergency fund and reducing spending volatility'
    };
  } else if (riskScore >= 3) {
    return {
      level: 'Medium',
      description: 'Your financial situation is moderately stable with some areas for improvement.',
      recommendation: 'Consider increasing your savings rate and maintaining consistent spending patterns'
    };
  } else {
    return {
      level: 'Low',
      description: 'Your financial situation is stable with good savings habits and consistent spending.',
      recommendation: 'Continue your current financial practices and consider investment opportunities'
    };
  }
}

function calculateSpendingVolatility(transactions: Transaction[]): number {
  const monthlyData = calculateMonthlySpending(transactions);
  if (monthlyData.length < 2) return 0;
  
  const values = monthlyData.map(m => m.total);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  return mean > 0 ? standardDeviation / mean : 0;
}

function generateAISummary(transactions: Transaction[], financialMetrics: any, timeframe: string) {
  const insights = [];
  
  // Overall financial health
  const savingsRate = financialMetrics.savingsRate || 0;
  if (savingsRate > 20) {
    insights.push({
      type: 'success',
      title: 'Excellent Financial Health',
      description: `Your savings rate of ${savingsRate.toFixed(1)}% is well above the recommended 20%. You're on track for long-term financial success.`,
      recommendation: 'Consider exploring investment opportunities to grow your wealth further.'
    });
  } else if (savingsRate < 10) {
    insights.push({
      type: 'warning',
      title: 'Financial Health Needs Attention',
      description: `Your savings rate of ${savingsRate.toFixed(1)}% is below the recommended 20%. This could impact your long-term financial security.`,
      recommendation: 'Focus on reducing expenses or increasing income to improve your savings rate.'
    });
  }
  
  // Spending patterns
  const spendingVolatility = calculateSpendingVolatility(transactions);
  if (spendingVolatility > 0.3) {
    insights.push({
      type: 'warning',
      title: 'High Spending Volatility',
      description: 'Your spending patterns show significant month-to-month variation, which can make budgeting challenging.',
      recommendation: 'Try to maintain more consistent spending patterns and build a monthly budget.'
    });
  }
  
  return insights;
}
