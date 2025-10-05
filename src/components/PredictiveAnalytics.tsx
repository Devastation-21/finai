"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Transaction } from "@/types";

interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  healthScore: number;
}

interface PredictiveAnalyticsProps {
  transactions: Transaction[];
  financialMetrics: FinancialMetrics;
}

interface Prediction {
  type: 'spending' | 'savings' | 'budget' | 'trend';
  title: string;
  value: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function PredictiveAnalytics({ transactions, financialMetrics }: PredictiveAnalyticsProps) {
  // Calculate predictions based on historical data
  const predictions = calculatePredictions(transactions, financialMetrics);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Trend Analysis & Projections</h2>
        <Badge variant="outline" className="ml-auto">
          Statistical Analysis
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((prediction, index) => (
          <Card key={index} className="relative overflow-hidden">
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
                  variant={prediction.trend === 'up' ? 'destructive' : prediction.trend === 'down' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {prediction.trend === 'up' ? '↗' : prediction.trend === 'down' ? '↘' : '→'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(prediction.value)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {prediction.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence</span>
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

      {/* AI Insights */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pattern-Based Insights
          </CardTitle>
          <CardDescription>
            Based on statistical analysis of your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generateAIInsights(transactions, financialMetrics).map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 mt-1">
                  {insight.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : insight.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculatePredictions(transactions: Transaction[], financialMetrics: FinancialMetrics): Prediction[] {
  if (!transactions.length || !financialMetrics) {
    return [];
  }

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  // Get last 3 months of data
  const recentTransactions = transactions.filter(t => 
    new Date(t.date) >= twoMonthsAgo
  );

  // Calculate monthly spending averages
  const monthlySpending = calculateMonthlySpending(recentTransactions);
  const avgMonthlySpending = monthlySpending.reduce((sum, month) => sum + month.total, 0) / monthlySpending.length;

  // Calculate spending trend
  const spendingTrend = calculateTrend(monthlySpending.map(m => m.total));
  
  // Predict next month's spending
  const nextMonthSpending = avgMonthlySpending * (1 + spendingTrend * 0.1);
  
  // Predict savings based on current pattern
  const currentSavings = financialMetrics.savings || 0;
  const monthlySavings = financialMetrics.totalIncome - financialMetrics.totalExpenses;
  const projectedSavings = currentSavings + (monthlySavings * 6); // 6 months projection

  // Budget projection (assuming 50k monthly budget)
  const monthlyBudget = 50000;
  const budgetUtilization = (avgMonthlySpending / monthlyBudget) * 100;
  const monthsToBudgetExhaustion = monthlyBudget / avgMonthlySpending;

  const predictions: Prediction[] = [
    {
      type: 'spending',
      title: 'Next Month Spending',
      value: nextMonthSpending,
      confidence: Math.min(85, 60 + (recentTransactions.length * 2)),
      timeframe: 'Next 30 days',
      trend: spendingTrend > 0.05 ? 'up' : spendingTrend < -0.05 ? 'down' : 'stable',
      description: `Based on ${monthlySpending.length} months of data`,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      type: 'savings',
      title: '6-Month Savings',
      value: projectedSavings,
      confidence: monthlySavings > 0 ? 75 : 45,
      timeframe: '6 months ahead',
      trend: monthlySavings > 0 ? 'up' : 'down',
      description: `Current monthly savings: ${formatCurrency(monthlySavings)}`,
      icon: <Target className="h-4 w-4" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      type: 'budget',
      title: 'Budget Health',
      value: budgetUtilization,
      confidence: 80,
      timeframe: 'Current month',
      trend: budgetUtilization > 80 ? 'up' : budgetUtilization < 50 ? 'down' : 'stable',
      description: `${budgetUtilization.toFixed(1)}% of monthly budget used`,
      icon: <BarChart3 className="h-4 w-4" />,
      color: budgetUtilization > 80 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
    },
    {
      type: 'trend',
      title: 'Spending Trend',
      value: Math.abs(spendingTrend * 100),
      confidence: 70,
      timeframe: 'Last 3 months',
      trend: spendingTrend > 0.05 ? 'up' : spendingTrend < -0.05 ? 'down' : 'stable',
      description: spendingTrend > 0.05 ? 'Spending increasing' : spendingTrend < -0.05 ? 'Spending decreasing' : 'Spending stable',
      icon: spendingTrend > 0.05 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      color: spendingTrend > 0.05 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
    }
  ];

  return predictions;
}

function calculateMonthlySpending(transactions: Transaction[]) {
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

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    total: data.total,
    count: data.count
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

function generateAIInsights(transactions: Transaction[], financialMetrics: FinancialMetrics) {
  const insights = [];
  
  // Spending pattern analysis
  const recentSpending = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const avgDailySpending = recentSpending / 30;
  
  if (avgDailySpending > 2000) {
    insights.push({
      type: 'warning',
      title: 'High Daily Spending',
      description: `You're spending an average of ${formatCurrency(avgDailySpending)} per day. Consider reviewing your expenses.`
    });
  }
  
  // Savings rate analysis
  const savingsRate = financialMetrics.totalIncome > 0 ? 
    ((financialMetrics.savings || 0) / financialMetrics.totalIncome) * 100 : 0;
  if (savingsRate < 10) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`
    });
  } else if (savingsRate > 30) {
    insights.push({
      type: 'success',
      title: 'Excellent Savings Rate',
      description: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`
    });
  }
  
  // Category analysis
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topCategory && topCategory[1] > recentSpending * 0.4) {
    insights.push({
      type: 'warning',
      title: 'Category Concentration',
      description: `${topCategory[0]} accounts for ${((topCategory[1] / recentSpending) * 100).toFixed(1)}% of your spending. Consider diversifying.`
    });
  }
  
  return insights;
}
