"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface MonthlyComparisonChartProps {
  transactions: any[];
}

export function MonthlyComparisonChart({ transactions }: MonthlyComparisonChartProps) {
  // Process transactions to get monthly data
  const processData = () => {
    const monthlyData: { [key: string]: { month: string; income: number; expenses: number; savings: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          income: 0,
          expenses: 0,
          savings: 0
        };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
      }
    });
    
    // Calculate savings for each month
    Object.values(monthlyData).forEach(month => {
      month.savings = month.income - month.expenses;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const chartData = processData();
  
  // Calculate overall trends
  const totalIncome = chartData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = chartData.reduce((sum, month) => sum + month.expenses, 0);
  const totalSavings = totalIncome - totalExpenses;
  
  const avgMonthlyIncome = chartData.length > 0 ? totalIncome / chartData.length : 0;
  const avgMonthlyExpenses = chartData.length > 0 ? totalExpenses / chartData.length : 0;
  const avgMonthlySavings = avgMonthlyIncome - avgMonthlyExpenses;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>Compare your income and expenses by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data available yet</p>
              <p className="text-sm">Add transactions to see monthly trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Monthly Trends
              <Badge variant="outline" className="text-xs">Trend</Badge>
            </CardTitle>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded"></div>
              <span>In</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded"></div>
              <span>Out</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span>Net</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="income" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="Income"
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                name="Expenses"
              />
              <Bar 
                dataKey="savings" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Savings"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
          <div className="text-center p-2 border border-muted rounded">
            <p className="text-lg font-bold">{formatCurrency(avgMonthlyIncome)}</p>
            <p className="text-xs text-muted-foreground">Avg Income</p>
          </div>
          <div className="text-center p-2 border border-muted rounded">
            <p className="text-lg font-bold">{formatCurrency(avgMonthlyExpenses)}</p>
            <p className="text-xs text-muted-foreground">Avg Spending</p>
          </div>
          <div className="text-center p-2 border border-muted rounded">
            <p className={`text-lg font-bold ${avgMonthlySavings >= 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {formatCurrency(avgMonthlySavings)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Savings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
