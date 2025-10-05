"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  Heart 
} from "lucide-react";
import { FinancialMetrics as FinancialMetricsType } from "@/types";

interface FinancialMetricsProps {
  metrics: FinancialMetricsType;
}

export function FinancialMetrics({ metrics }: FinancialMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const metricsData = [
    {
      title: "Total Income",
      value: formatCurrency(metrics.totalIncome),
      icon: DollarSign,
      trend: metrics.incomeTrend,
      description: "Monthly income",
      color: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(metrics.totalExpenses),
      icon: CreditCard,
      trend: metrics.expenseTrend,
      description: "Monthly expenses",
      color: "text-red-600",
    },
    {
      title: "Savings",
      value: formatCurrency(metrics.savings),
      icon: PiggyBank,
      trend: metrics.savings > 0 ? 'up' : 'down' as const,
      description: `${metrics.savingsRate.toFixed(1)}% savings rate`,
      color: "text-blue-600",
    },
    {
      title: "Health Score",
      value: `${metrics.healthScore}/100`,
      icon: Heart,
      trend: 'stable' as const,
      description: "Financial health",
      color: getHealthScoreColor(metrics.healthScore),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                {metric.title === "Health Score" && (
                  <Badge className={getHealthScoreBadge(metrics.healthScore)}>
                    {metrics.healthScore >= 80 ? "Excellent" : 
                     metrics.healthScore >= 60 ? "Good" : "Needs Attention"}
                  </Badge>
                )}
              </div>

              {/* Trend indicator for income/expenses */}
              {(metric.title === "Total Income" || metric.title === "Total Expenses") && (
                <div className="flex items-center space-x-1">
                  <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs last month
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


