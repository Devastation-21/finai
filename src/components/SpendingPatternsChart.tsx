"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface SpendingPatternsChartProps {
  transactions: any[];
}

export function SpendingPatternsChart({ transactions }: SpendingPatternsChartProps) {
  // Group transactions by day of week
  const dayOfWeekData = transactions.reduce((acc, transaction) => {
    const day = new Date(transaction.date).toLocaleDateString('en-US', { weekday: 'short' });
    if (!acc[day]) {
      acc[day] = { income: 0, expenses: 0, count: 0 };
    }
    if (transaction.type === 'income') {
      acc[day].income += transaction.amount;
    } else {
      acc[day].expenses += Math.abs(transaction.amount);
    }
    acc[day].count++;
    return acc;
  }, {} as any);

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    income: dayOfWeekData[day]?.income || 0,
    expenses: dayOfWeekData[day]?.expenses || 0,
    net: (dayOfWeekData[day]?.income || 0) - (dayOfWeekData[day]?.expenses || 0),
    count: dayOfWeekData[day]?.count || 0
  }));

  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const avgDailySpending = totalExpenses / 7;

  // Find peak spending day
  const peakSpendingDay = chartData.reduce((max, item) => 
    item.expenses > max.expenses ? item : max
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Spending Patterns
          <Badge variant="outline" className="text-xs">Weekly</Badge>
        </CardTitle>
        <CardDescription>
          When do you spend most? (Peak: {peakSpendingDay.day} - {formatCurrency(peakSpendingDay.expenses)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net'
                ]}
              />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
          <div className="text-center p-2 border border-muted rounded">
            <p className="text-lg font-bold">{formatCurrency(avgDailySpending)}</p>
            <p className="text-xs text-muted-foreground">Avg Daily</p>
          </div>
          <div className="text-center p-2 border border-muted rounded">
            <p className="text-lg font-bold">{peakSpendingDay.day}</p>
            <p className="text-xs text-muted-foreground">Peak Day</p>
          </div>
          <div className="text-center p-2 border border-muted rounded">
            <p className="text-lg font-bold">{Math.round(totalExpenses / totalIncome * 100)}%</p>
            <p className="text-xs text-muted-foreground">Spend Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

