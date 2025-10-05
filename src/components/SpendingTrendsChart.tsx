"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Transaction {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface SpendingTrendsChartProps {
  transactions: Transaction[];
}

export function SpendingTrendsChart({ transactions }: SpendingTrendsChartProps) {
  // Process transactions to get daily spending data
  const processData = () => {
    const dailyData: { [key: string]: { date: string; income: number; expenses: number; net: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          income: 0,
          expenses: 0,
          net: 0
        };
      }
      
      if (transaction.type === 'income') {
        dailyData[date].income += transaction.amount;
      } else {
        dailyData[date].expenses += Math.abs(transaction.amount);
      }
    });
    
    // Calculate net (income - expenses)
    Object.values(dailyData).forEach(day => {
      day.net = day.income - day.expenses;
    });
    
    return Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = processData();
  
  // Calculate trends
  const totalIncome = chartData.reduce((sum, day) => sum + day.income, 0);
  const totalExpenses = chartData.reduce((sum, day) => sum + day.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  
  const incomeTrend = chartData.length > 1 ? 
    ((chartData[chartData.length - 1].income - chartData[0].income) / Math.max(chartData[0].income, 1)) * 100 : 0;
  const expenseTrend = chartData.length > 1 ? 
    ((chartData[chartData.length - 1].expenses - chartData[0].expenses) / Math.max(chartData[0].expenses, 1)) * 100 : 0;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>Track your daily income and expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data available yet</p>
              <p className="text-sm">Upload transactions to see trends</p>
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
            <CardTitle className="flex items-center gap-2">
              Money Flow
              <Badge variant="outline" className="text-xs">Live</Badge>
            </CardTitle>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>In</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Out</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Net</span>
              </div>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
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
                  name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net Savings'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
          <div className="text-center p-2 border border-muted rounded">
            <p className="text-lg font-bold">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
          <div className="text-center p-2 border border-muted rounded">
            <p className="text-lg font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground">Spent</p>
          </div>
          <div className="text-center p-2 border border-muted rounded">
            <p className={`text-lg font-bold ${netSavings >= 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {formatCurrency(netSavings)}
            </p>
            <p className="text-xs text-muted-foreground">Net</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
