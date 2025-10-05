"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { SpendingTrendsChart } from "@/components/SpendingTrendsChart";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { MonthlyComparisonChart } from "@/components/MonthlyComparisonChart";
import { SpendingPatternsChart } from "@/components/SpendingPatternsChart";
import { FinancialHealthScore } from "@/components/FinancialHealthScore";
import { SpendingTrendsAnalysis } from "@/components/SpendingTrendsAnalysis";
import { FinancialInsights } from "@/components/FinancialInsights";
import { SimpleMLPredictions } from "@/components/SimpleMLPredictions";
import { ChartTips } from "@/components/ChartTips";
import { AISidebar } from "@/components/AISidebar";
import { useUserData } from "@/hooks/useUserData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  PieChart, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Badge
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { 
    user: dbUser, 
    transactions, 
    financialMetrics, 
    spendingCategories, 
    loading: dataLoading, 
    error, 
    refreshData 
  } = useUserData();
  
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your analytics.
          </p>
          <a href="/login" className="text-primary hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />
        <main 
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ease-in-out"
          style={{
            transform: isChatOpen ? 'translateX(-12rem)' : 'translateX(0)',
            width: isChatOpen ? 'calc(100% - 24rem)' : '100%'
          }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your analytics...</p>
          </div>
        </main>
        <AISidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    );
  }

  // Show error if data loading failed
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Error Loading Analytics</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={refreshData}
            className="text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasData = transactions.length > 0 || financialMetrics;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-background">
        <Header onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />
        <main 
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ease-in-out"
          style={{
            transform: isChatOpen ? 'translateX(-12rem)' : 'translateX(0)',
            width: isChatOpen ? 'calc(100% - 24rem)' : '100%'
          }}
        >
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">No Analytics Data Yet</h1>
            <p className="text-muted-foreground mb-6">
              Upload your financial data or add transactions to see detailed analytics and insights.
            </p>
            <div className="space-y-3">
              <a href="/upload" className="block">
                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                  Upload Financial Data
                </button>
              </a>
              <a href="/transactions" className="block">
                <button className="w-full border border-input bg-background px-4 py-2 rounded-md hover:bg-accent">
                  Add Transactions
                </button>
              </a>
            </div>
          </div>
        </main>
        <AISidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />
      
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${isChatOpen ? 'lg:mr-96' : ''}`}>
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep insights into your financial patterns and trends
          </p>
        </div>

        {/* Financial Health Score - Prominent */}
        <FinancialHealthScore financialMetrics={financialMetrics} transactions={transactions} />

        {/* Advanced Analytics Grid */}
        <div className="space-y-6">
          {/* Trend Analysis & Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingTrendsAnalysis transactions={transactions} />
            <SpendingPatternsChart transactions={transactions} />
          </div>

          {/* Detailed Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingTrendsChart transactions={transactions} />
            <CategoryBreakdownChart transactions={transactions} />
          </div>
          
          {/* Monthly Analysis */}
          <MonthlyComparisonChart transactions={transactions} />

          {/* Financial Insights & Trends */}
          <FinancialInsights transactions={transactions} financialMetrics={financialMetrics} />

          {/* Future Spending Forecast */}
          <SimpleMLPredictions transactions={transactions} financialMetrics={financialMetrics} />


          {/* Key Insights */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Insights
                  <Badge className="text-xs">AI Generated</Badge>
                </CardTitle>
              <CardDescription>
                Personalized recommendations based on your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border border-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-sm">Income Growth</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your income has grown 12% this quarter. Consider increasing your savings rate.
                  </p>
                </div>
                
                <div className="p-4 border border-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-sm">Spending Alert</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Weekend spending is 40% higher than weekdays. Track your entertainment budget.
                  </p>
                </div>
                
                <div className="p-4 border border-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm">Goal Progress</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You're 75% towards your emergency fund goal. Keep up the great work!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* AI Sidebar */}
      <AISidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}