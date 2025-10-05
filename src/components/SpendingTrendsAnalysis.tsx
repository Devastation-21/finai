"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from "lucide-react";

interface SpendingTrendsAnalysisProps {
  transactions: any[];
}

export function SpendingTrendsAnalysis({ transactions }: SpendingTrendsAnalysisProps) {
  // Analyze spending trends over last 6 months
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0, count: 0 };
    }
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expenses += Math.abs(transaction.amount);
    }
    acc[month].count++;
    return acc;
  }, {} as any);

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6); // Last 6 months

  // Calculate trends
  const incomeTrend = calculateTrend(sortedMonths.map(([, data]) => data.income));
  const expenseTrend = calculateTrend(sortedMonths.map(([, data]) => data.expenses));
  const savingsTrend = calculateTrend(sortedMonths.map(([, data]) => data.income - data.expenses));

  // Find insights
  const insights = generateInsights(incomeTrend, expenseTrend, savingsTrend, monthlyData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Trend Analysis
          <Badge variant="outline" className="text-xs">6M</Badge>
        </CardTitle>
        <CardDescription>
          How your finances are trending over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trend Indicators */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border border-muted rounded">
              <div className="flex items-center justify-center mb-2">
                {incomeTrend > 5 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : incomeTrend < -5 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Minus className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <p className="text-sm font-semibold">Income</p>
              <p className={`text-xs ${incomeTrend > 5 ? 'text-green-600' : incomeTrend < -5 ? 'text-red-600' : 'text-yellow-600'}`}>
                {incomeTrend > 0 ? '+' : ''}{incomeTrend.toFixed(1)}%
              </p>
            </div>

            <div className="text-center p-3 border border-muted rounded">
              <div className="flex items-center justify-center mb-2">
                {expenseTrend > 5 ? (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                ) : expenseTrend < -5 ? (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                ) : (
                  <Minus className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <p className="text-sm font-semibold">Expenses</p>
              <p className={`text-xs ${expenseTrend > 5 ? 'text-red-600' : expenseTrend < -5 ? 'text-green-600' : 'text-yellow-600'}`}>
                {expenseTrend > 0 ? '+' : ''}{expenseTrend.toFixed(1)}%
              </p>
            </div>

            <div className="text-center p-3 border border-muted rounded">
              <div className="flex items-center justify-center mb-2">
                {savingsTrend > 5 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : savingsTrend < -5 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Minus className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <p className="text-sm font-semibold">Savings</p>
              <p className={`text-xs ${savingsTrend > 5 ? 'text-green-600' : savingsTrend < -5 ? 'text-red-600' : 'text-yellow-600'}`}>
                {savingsTrend > 0 ? '+' : ''}{savingsTrend.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Key Insights</h4>
            {insights.map((insight, index) => (
              <div key={index} className={`flex items-start gap-2 p-2 rounded border ${
                insight.type === 'positive' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
                insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                'border-red-200 bg-red-50 dark:bg-red-950/20'
              }`}>
                {insight.type === 'positive' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <p className="text-xs text-foreground">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  return ((last - first) / first) * 100;
}

function generateInsights(incomeTrend: number, expenseTrend: number, savingsTrend: number, monthlyData: any) {
  const insights = [];

  if (incomeTrend > 10) {
    insights.push({
      type: 'positive',
      message: `Income is growing strong at ${incomeTrend.toFixed(1)}% monthly`
    });
  } else if (incomeTrend < -10) {
    insights.push({
      type: 'negative',
      message: `Income declining by ${Math.abs(incomeTrend).toFixed(1)}% - review income sources`
    });
  }

  if (expenseTrend > 15) {
    insights.push({
      type: 'warning',
      message: `Expenses rising ${expenseTrend.toFixed(1)}% - consider budgeting`
    });
  } else if (expenseTrend < -10) {
    insights.push({
      type: 'positive',
      message: `Great cost control - expenses down ${Math.abs(expenseTrend).toFixed(1)}%`
    });
  }

  if (savingsTrend > 20) {
    insights.push({
      type: 'positive',
      message: `Savings growing ${savingsTrend.toFixed(1)}% - excellent progress!`
    });
  } else if (savingsTrend < -20) {
    insights.push({
      type: 'negative',
      message: `Savings declining ${Math.abs(savingsTrend).toFixed(1)}% - urgent attention needed`
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      message: 'Your financial trends are stable - consider setting new goals'
    });
  }

  return insights;
}

