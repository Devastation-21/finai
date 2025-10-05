"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { Heart, TrendingUp, AlertCircle, CheckCircle, Target } from "lucide-react";

interface FinancialHealthScoreProps {
  financialMetrics: any;
  transactions: any[];
}

export function FinancialHealthScore({ financialMetrics, transactions }: FinancialHealthScoreProps) {
  if (!financialMetrics) return null;

  // Calculate health score based on multiple factors
  const savingsRate = financialMetrics.savings_rate || 0;
  const totalIncome = financialMetrics.total_income || 0;
  const totalExpenses = financialMetrics.total_expenses || 0;
  
  // Calculate spending consistency (lower variance = better)
  const monthlySpending = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = 0;
    if (t.type === 'expense') acc[month] += Math.abs(t.amount);
    return acc;
  }, {} as any);

  const spendingValues = Object.values(monthlySpending) as number[];
  const avgSpending = spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length;
  const spendingVariance = spendingValues.reduce((sum, val) => sum + Math.pow(val - avgSpending, 2), 0) / spendingValues.length;
  const spendingConsistency = Math.max(0, 100 - (Math.sqrt(spendingVariance) / avgSpending * 100));

  // Calculate emergency fund ratio (assuming 3 months expenses as target)
  const emergencyFundTarget = totalExpenses * 3;
  const emergencyFundRatio = Math.min(100, (financialMetrics.savings || 0) / emergencyFundTarget * 100);

  // Overall health score (weighted average)
  const healthScore = Math.round(
    (savingsRate * 0.4) + 
    (spendingConsistency * 0.3) + 
    (emergencyFundRatio * 0.3)
  );

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', icon: TrendingUp };
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', icon: AlertCircle };
    return { level: 'Needs Work', color: 'text-red-600', icon: AlertCircle };
  };

  const healthLevel = getHealthLevel(healthScore);
  const Icon = healthLevel.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Financial Health
          <Badge variant="outline" className="text-xs">AI Analysis</Badge>
        </CardTitle>
        <CardDescription>
          Overall financial wellness score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Score */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${healthScore * 2.51} 251`}
                  className={healthLevel.color}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${healthLevel.color}`}>
                  {healthScore}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Icon className={`h-5 w-5 ${healthLevel.color}`} />
              <span className={`font-semibold ${healthLevel.color}`}>
                {healthLevel.level}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Savings Rate</span>
                <span>{savingsRate.toFixed(1)}%</span>
              </div>
              <Progress value={savingsRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Spending Consistency</span>
                <span>{spendingConsistency.toFixed(1)}%</span>
              </div>
              <Progress value={spendingConsistency} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Emergency Fund</span>
                <span>{emergencyFundRatio.toFixed(1)}%</span>
              </div>
              <Progress value={emergencyFundRatio} className="h-2" />
            </div>
          </div>

          {/* Recommendations */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Quick Wins</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              {savingsRate < 20 && (
                <p>• Increase savings rate to 20%+</p>
              )}
              {spendingConsistency < 70 && (
                <p>• Create a monthly budget</p>
              )}
              {emergencyFundRatio < 50 && (
                <p>• Build emergency fund (3 months expenses)</p>
              )}
              {healthScore >= 80 && (
                <p>• Great job! Keep up the excellent work</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

