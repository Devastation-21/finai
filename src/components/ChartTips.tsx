"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  CheckCircle,
  X
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

interface ChartTipsProps {
  financialMetrics?: FinancialMetrics;
  transactions: Transaction[];
}

export function ChartTips({ financialMetrics, transactions }: ChartTipsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Lightbulb className="h-4 w-4 mr-2" />
        Show Tips
      </Button>
    );
  }

  const getTips = () => {
    const tips = [];
    
    if (financialMetrics) {
      const savingsRate = financialMetrics.savings_rate || 0;
      const totalIncome = financialMetrics.total_income || 0;
      const totalExpenses = financialMetrics.total_expenses || 0;
      
      // Savings rate tips
      if (savingsRate > 20) {
        tips.push({
          type: 'success',
          icon: CheckCircle,
          title: 'Excellent Savings!',
          message: `You're saving ${savingsRate.toFixed(1)}% of your income. That's fantastic!`,
          color: 'text-green-600 dark:text-green-400'
        });
      } else if (savingsRate > 10) {
        tips.push({
          type: 'good',
          icon: TrendingUp,
          title: 'Good Savings Rate',
          message: `You're saving ${savingsRate.toFixed(1)}% of your income. Try to aim for 20%+`,
          color: 'text-blue-600 dark:text-blue-400'
        });
      } else if (savingsRate > 0) {
        tips.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Low Savings Rate',
          message: `You're only saving ${savingsRate.toFixed(1)}% of your income. Try to increase this!`,
          color: 'text-orange-600 dark:text-orange-400'
        });
      } else {
        tips.push({
          type: 'danger',
          icon: TrendingDown,
          title: 'Spending More Than Earning',
          message: 'You\'re spending more than you earn. This is not sustainable long-term.',
          color: 'text-red-600 dark:text-red-400'
        });
      }
      
      // Income vs expenses tips
      if (totalIncome > 0 && totalExpenses > 0) {
        const expenseRatio = (totalExpenses / totalIncome) * 100;
        if (expenseRatio > 90) {
          tips.push({
            type: 'warning',
            icon: AlertCircle,
            title: 'High Expense Ratio',
            message: `You're spending ${expenseRatio.toFixed(1)}% of your income. Try to reduce expenses.`,
            color: 'text-orange-600 dark:text-orange-400'
          });
        }
      }
    }
    
    // Transaction-based tips
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    if (expenseTransactions.length > 0) {
      const avgExpense = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / expenseTransactions.length;
      if (avgExpense > 100) {
        tips.push({
          type: 'info',
          icon: Target,
          title: 'Large Average Expenses',
          message: `Your average expense is $${avgExpense.toFixed(2)}. Consider if all purchases are necessary.`,
          color: 'text-blue-600 dark:text-blue-400'
        });
      }
    }
    
    return tips;
  };

  const tips = getTips();

  if (tips.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            AI Tips
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.slice(0, 3).map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div key={index} className="flex items-start gap-2 p-2 rounded border border-muted">
              <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <h4 className="font-medium text-xs text-foreground">{tip.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{tip.message}</p>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Updates with your data
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
