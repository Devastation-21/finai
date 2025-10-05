"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Transaction {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export function CategoryBreakdownChart({ transactions }: CategoryBreakdownChartProps) {
  // Process transactions to get category data
  const processData = () => {
    const categoryData: { [key: string]: { name: string; value: number; count: number } } = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = transaction.category;
        if (!categoryData[category]) {
          categoryData[category] = {
            name: category,
            value: 0,
            count: 0
          };
        }
        categoryData[category].value += Math.abs(transaction.amount);
        categoryData[category].count += 1;
      }
    });
    
    return Object.values(categoryData).sort((a, b) => b.value - a.value);
  };

  const chartData = processData();
  const totalExpenses = chartData.reduce((sum, category) => sum + category.value, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Breakdown of your expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expense data available</p>
              <p className="text-sm">Add transactions to see category breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
          <p className="text-xs text-muted-foreground">
            Category breakdown
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Spending by Category
            <Badge variant="outline" className="text-xs">AI</Badge>
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category List */}
        <div className="mt-4 space-y-2">
          {chartData.slice(0, 4).map((category, index) => {
            const percentage = ((category.value / totalExpenses) * 100).toFixed(0);
            const isTopSpender = index === 0;
            return (
              <div key={category.name} className={`flex items-center justify-between p-2 rounded border ${isTopSpender ? 'border-primary/20 bg-primary/5' : 'border-muted'}`}>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className={`text-sm ${isTopSpender ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {category.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isTopSpender ? 'text-primary' : 'text-foreground'}`}>
                    {formatCurrency(category.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
