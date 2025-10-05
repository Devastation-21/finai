"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  DollarSign,
  BarChart3
} from "lucide-react";

interface Transaction {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  healthScore: number;
}

interface FinancialInsightsProps {
  transactions: Transaction[];
  financialMetrics: FinancialMetrics;
}

export function FinancialInsights({ transactions, financialMetrics }: FinancialInsightsProps) {
  // Calculate real insights from actual data
  const insights = calculateRealInsights(transactions, financialMetrics);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Financial Insights & Trends</h2>
        <Badge variant="outline" className="ml-auto">
          Data-Driven
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Spending Trend */}
        <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {insights.spendingTrend > 0 ? '+' : ''}{insights.spendingTrend}%
              </div>
              <p className="text-sm text-muted-foreground">
                {insights.spendingTrend > 0 ? 'Increasing' : 'Decreasing'} compared to last month
              </p>
              {insights.spendingTrend > 10 && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Consider reviewing your budget
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Spending Category */}
        <Card className="border-l-4 border-l-red-500 dark:border-l-red-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">{insights.topCategory}</div>
              <p className="text-sm text-muted-foreground">
                ₹{(insights.topCategoryAmount as number).toLocaleString()} this month
              </p>
              <div className="text-xs text-muted-foreground">
                {insights.topCategoryPercentage}% of total spending
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{insights.savingsRate}%</div>
              <p className="text-sm text-muted-foreground">
                {insights.savingsRate > 20 ? 'Excellent!' : insights.savingsRate > 10 ? 'Good' : 'Needs improvement'}
              </p>
              {insights.savingsRate < 10 && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Try to save at least 10%
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              This Month vs Last
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">
                ₹{insights.monthlyComparison.difference > 0 ? '+' : ''}{insights.monthlyComparison.difference.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {insights.monthlyComparison.difference > 0 ? 'More' : 'Less'} than last month
              </p>
              <div className="text-xs text-muted-foreground">
                Last month: ₹{insights.monthlyComparison.lastMonth.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spending Velocity */}
        <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4" />
              Spending Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">₹{insights.dailyAverage.toLocaleString()}/day</div>
              <p className="text-sm text-muted-foreground">
                Average daily spending
              </p>
              <div className="text-xs text-muted-foreground">
                {insights.daysLeftInMonth} days left this month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Health Score */}
        <Card className="border-l-4 border-l-indigo-500 dark:border-l-indigo-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{insights.healthScore}/100</div>
              <p className="text-sm text-muted-foreground">
                {insights.healthScore > 80 ? 'Excellent' : insights.healthScore > 60 ? 'Good' : 'Needs attention'}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    insights.healthScore > 80 ? 'bg-green-500' : 
                    insights.healthScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${insights.healthScore}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Recommendations */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Actionable Recommendations
          </CardTitle>
          <CardDescription>
            Based on your actual spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-border">
                <div className="flex-shrink-0 mt-1">
                  {rec.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{rec.title}</p>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  {rec.action && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">{rec.action}</p>
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

function calculateRealInsights(transactions: Transaction[], financialMetrics: FinancialMetrics) {
  if (!transactions || transactions.length === 0) {
    return {
      spendingTrend: 0,
      topCategory: 'No data',
      topCategoryAmount: 0,
      topCategoryPercentage: 0,
      savingsRate: 0,
      monthlyComparison: { difference: 0, lastMonth: 0 },
      dailyAverage: 0,
      daysLeftInMonth: 0,
      healthScore: 0,
      recommendations: []
    };
  }

  // Calculate spending by category
  const categorySpending = transactions.reduce((acc, transaction) => {  
    if (transaction.type === 'expense') {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Find top category
  const topCategory = Object.entries(categorySpending).reduce((a, b) => 
    categorySpending[a[0]] > categorySpending[b[0]] ? a : b, ['No data', 0]
  );

  // Calculate monthly spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const lastMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return transactionDate.getMonth() === lastMonth && 
           transactionDate.getFullYear() === lastMonthYear;
  });

  const currentMonthSpending = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthSpending = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate trends and metrics
  const spendingTrend = lastMonthSpending > 0 
    ? Math.round(((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100)
    : 0;

  const totalIncome = financialMetrics?.totalIncome || 0;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - currentMonthSpending) / totalIncome) * 100) : 0;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysLeftInMonth = daysInMonth - currentDay;
  const dailyAverage = currentDay > 0 ? Math.round(currentMonthSpending / currentDay) : 0;

  // Calculate health score (0-100)
  let healthScore = 50; // Base score
  
  if (savingsRate > 20) healthScore += 30;
  else if (savingsRate > 10) healthScore += 20;
  else if (savingsRate > 0) healthScore += 10;
  else healthScore -= 20;

  if (spendingTrend < 5) healthScore += 20;
  else if (spendingTrend > 20) healthScore -= 20;

  if (dailyAverage < 1000) healthScore += 10;
  else if (dailyAverage > 5000) healthScore -= 10;

  healthScore = Math.max(0, Math.min(100, healthScore));

  // Generate recommendations
  const recommendations = [];

  if (spendingTrend > 15) {
    recommendations.push({
      type: 'warning',
      title: 'High Spending Increase',
      description: `Your spending increased by ${spendingTrend}% this month.`,
      action: 'Review your budget and identify areas to cut back.'
    });
  }

  if (savingsRate < 10) {
    recommendations.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `You're only saving ${savingsRate}% of your income.`,
      action: 'Try to save at least 10-20% of your income each month.'
    });
  }

  if (topCategory[1] > currentMonthSpending * 0.4) {
    recommendations.push({
      type: 'warning',
      title: 'Concentrated Spending',
      description: `${topCategory[0]} accounts for ${Math.round((topCategory[1] / currentMonthSpending) * 100)}% of your spending.`,
      action: 'Consider diversifying your spending across categories.'
    });
  }

  if (healthScore > 80) {
    recommendations.push({
      type: 'success',
      title: 'Great Financial Health!',
      description: 'You\'re doing well with your finances.',
      action: 'Keep up the good work and consider increasing your savings goals.'
    });
  }

  return {
    spendingTrend,
    topCategory: topCategory[0],
    topCategoryAmount: topCategory[1],
    topCategoryPercentage: Math.round((topCategory[1] / currentMonthSpending) * 100),
    savingsRate,
    monthlyComparison: {
      difference: currentMonthSpending - lastMonthSpending,
      lastMonth: lastMonthSpending
    },
    dailyAverage,
    daysLeftInMonth,
    healthScore,
    recommendations
  };
}
