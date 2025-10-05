"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  MapPin,
  Star
} from "lucide-react";
import { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Food & Dining": Receipt,
  "Transportation": MapPin,
  "Shopping": Receipt,
  "Entertainment": Star,
  "Bills & Utilities": Receipt,
  "Healthcare": Receipt,
  "Education": Receipt,
  "Travel": MapPin,
  "Income": TrendingUp,
  "Other": Receipt,
};

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "Transportation": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Shopping": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Entertainment": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "Bills & Utilities": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Healthcare": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Education": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "Travel": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  "Income": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "Other": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function TransactionList({ transactions }: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    if (confidence >= 0.9) {
      return <Badge variant="secondary" className="text-xs">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="outline" className="text-xs">Medium</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">Low</Badge>;
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Upload your financial data to see your recent transactions and spending patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Recent Transactions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Last {transactions.length} transactions
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const CategoryIcon = categoryIcons[transaction.category] || Receipt;
              const isIncome = transaction.type === 'income';
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isIncome 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                    }`}>
                      {isIncome ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {transaction.description}
                        </p>
                        {getConfidenceBadge(transaction.confidence)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transaction.date)}
                        </div>
                        
                        {transaction.merchant && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {transaction.merchant}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <div className={`text-sm font-semibold ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${categoryColors[transaction.category] || categoryColors['Other']}`}
                    >
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {transaction.category}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


