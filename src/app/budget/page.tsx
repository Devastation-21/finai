"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import Link from "next/link";
// import { BudgetCategory, FinancialGoal } from "@/types";
import { AISidebar } from "@/components/AISidebar";
import { BudgetCategory, FinancialGoal } from "@/hooks/useBudgetData";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUserData } from "@/hooks/useUserData";
import { useBudgetData } from "@/hooks/useBudgetData";
import { BudgetCategoryForm } from "@/components/BudgetCategoryForm";
import { FinancialGoalForm } from "@/components/FinancialGoalForm";
import { EmailTestButton } from "@/components/EmailTestButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Bell,
  BarChart3,
  X,
  Mail,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";


export default function BudgetPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { sidebarWidth } = useSidebar();
  const { 
    user: dbUser, 
    transactions, 
    financialMetrics, 
    loading: dataLoading, 
    error, 
    refreshData 
  } = useUserData();
  
  const {
    budgetCategories,
    financialGoals,
    budgetAlerts,
    loading: budgetLoading,
    error: budgetError,
    refreshData: refreshBudgetData,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    markAlertAsRead
  } = useBudgetData();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  
  // Pagination state for budget alerts
  const [currentAlertPage, setCurrentAlertPage] = useState(1);
  const alertsPerPage = 5;
  
  // Calculate pagination for budget alerts
  const totalAlertPages = Math.ceil(budgetAlerts.length / alertsPerPage);
  const startAlertIndex = (currentAlertPage - 1) * alertsPerPage;
  const endAlertIndex = startAlertIndex + alertsPerPage;
  const paginatedAlerts = budgetAlerts.slice(startAlertIndex, endAlertIndex);
  
  // Reset to first page when alerts change
  useEffect(() => {
    setCurrentAlertPage(1);
  }, [budgetAlerts.length]);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access budget tracking.</p>
          <Link href="/login" className="text-primary hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (dataLoading || budgetLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  // Show error if data loading failed
  if (error || budgetError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Error Loading Budget Data</h1>
          <p className="text-muted-foreground mb-6">{error || budgetError}</p>
          <button 
            onClick={() => {
              refreshData();
              refreshBudgetData();
            }}
            className="text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalBudget = budgetCategories.reduce((sum, category) => sum + category.budget_amount, 0);
  const totalSpent = budgetCategories.reduce((sum, category) => sum + category.spent_amount, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleChat={handleToggleChat} isChatOpen={isChatOpen} />
      
      <main 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ease-in-out"
        style={{
          transform: isChatOpen ? 'translateX(-12rem)' : 'translateX(0)',
          width: isChatOpen ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Budget & Goals
            </h1>
            <p className="text-muted-foreground">
              Track your spending, set budgets, and achieve your financial goals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </Button>
            <BudgetCategoryForm onSave={addBudgetCategory} />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                {budgetCategories.length} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {budgetUtilization.toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalBudget - totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalBudget - totalSpent >= 0 ? 'Under budget' : 'Over budget'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Budget Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Budget Tracking</span>
                <Badge variant="secondary">
                  {budgetUtilization.toFixed(1)}% Used
                </Badge>
              </CardTitle>
              <CardDescription>
                Monitor your spending against budget limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No budget categories yet</p>
                    <p className="text-sm">Create your first budget to get started</p>
                  </div>
                ) : (
                  budgetCategories.map((category) => {
                    const percentage = (category.spent_amount / category.budget_amount) * 100;
                    const isOverBudget = category.spent_amount > category.budget_amount;
                    
                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(category.spent_amount)} / {formatCurrency(category.budget_amount)}
                            </span>
                            {isOverBudget ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingCategory(category)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteBudgetCategory(category.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% used</span>
                          <span>
                            {isOverBudget 
                              ? `${formatCurrency(category.spent_amount - category.budget_amount)} over` 
                              : `${formatCurrency(category.budget_amount - category.spent_amount)} remaining`
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Financial Goals</span>
                <FinancialGoalForm onSave={addFinancialGoal} />
              </CardTitle>
              <CardDescription>
                Track your progress towards financial milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialGoals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No financial goals yet</p>
                    <p className="text-sm">Set your first goal to start tracking progress</p>
                  </div>
                ) : (
                  financialGoals.map((goal) => {
                    const percentage = (goal.current_amount / goal.target_amount) * 100;
                    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                    
                    return (
                      <div key={goal.id} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{goal.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={percentage >= 100 ? "default" : "secondary"}>
                              {percentage.toFixed(1)}%
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingGoal(goal)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteFinancialGoal(goal.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{formatCurrency(goal.current_amount)}</span>
                            <span className="text-muted-foreground">of {formatCurrency(goal.target_amount)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {goal.deadline ? `Target: ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline'}
                          </span>
                          <span>
                            {daysLeft !== null 
                              ? (daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed')
                              : 'No deadline'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {goal.goal_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {goal.priority} priority
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Email Test Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Test budget alert email notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailTestButton />
              </CardContent>
            </Card>

            {/* Budget Alerts */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Budget Alerts
                  {budgetAlerts.length > 0 && (
                    <Badge variant="outline" className="ml-auto">
                      {budgetAlerts.length} total
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Stay informed about your spending and budget status
                </CardDescription>
              </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts yet</p>
                  <p className="text-sm">Alerts will appear here when you reach budget thresholds</p>
                </div>
              ) : (
                paginatedAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      alert.alert_type === 'over_budget' 
                        ? 'border-destructive/20 bg-destructive/5' 
                        : alert.alert_type === 'threshold_reached'
                        ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20'
                        : 'border-muted'
                    }`}
                  >
                    <AlertCircle className={`h-5 w-5 ${
                      alert.alert_type === 'over_budget' 
                        ? 'text-destructive' 
                        : alert.alert_type === 'threshold_reached'
                        ? 'text-orange-600'
                        : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        alert.alert_type === 'over_budget' 
                          ? 'text-destructive' 
                          : alert.alert_type === 'threshold_reached'
                          ? 'text-orange-800 dark:text-orange-200'
                          : 'text-foreground'
                      }`}>
                        {alert.alert_type === 'over_budget' ? 'Over Budget Alert' :
                         alert.alert_type === 'threshold_reached' ? 'Budget Warning' :
                         alert.alert_type === 'goal_achieved' ? 'Goal Achieved' :
                         'Deadline Approaching'}
                      </p>
                      <p className={`text-sm ${
                        alert.alert_type === 'over_budget' 
                          ? 'text-muted-foreground' 
                          : alert.alert_type === 'threshold_reached'
                          ? 'text-orange-700 dark:text-orange-300'
                          : 'text-muted-foreground'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAlertAsRead(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalAlertPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {startAlertIndex + 1}-{Math.min(endAlertIndex, budgetAlerts.length)} of {budgetAlerts.length} alerts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentAlertPage(prev => Math.max(1, prev - 1))}
                    disabled={currentAlertPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {(() => {
                      const maxVisiblePages = 5;
                      const startPage = Math.max(1, currentAlertPage - Math.floor(maxVisiblePages / 2));
                      const endPage = Math.min(totalAlertPages, startPage + maxVisiblePages - 1);
                      const pages = [];
                      
                      // Add first page and ellipsis if needed
                      if (startPage > 1) {
                        pages.push(
                          <Button
                            key={1}
                            variant={currentAlertPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentAlertPage(1)}
                            className="h-8 w-8 p-0"
                          >
                            1
                          </Button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span key="ellipsis1" className="px-2 text-muted-foreground">...</span>
                          );
                        }
                      }
                      
                      // Add visible pages
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentAlertPage === i ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentAlertPage(i)}
                            className="h-8 w-8 p-0"
                          >
                            {i}
                          </Button>
                        );
                      }
                      
                      // Add ellipsis and last page if needed
                      if (endPage < totalAlertPages) {
                        if (endPage < totalAlertPages - 1) {
                          pages.push(
                            <span key="ellipsis2" className="px-2 text-muted-foreground">...</span>
                          );
                        }
                        pages.push(
                          <Button
                            key={totalAlertPages}
                            variant={currentAlertPage === totalAlertPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentAlertPage(totalAlertPages)}
                            className="h-8 w-8 p-0"
                          >
                            {totalAlertPages}
                          </Button>
                        );
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentAlertPage(prev => Math.min(totalAlertPages, prev + 1))}
                    disabled={currentAlertPage === totalAlertPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* AI Sidebar */}
      <AISidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Edit Forms */}
        {editingCategory && (
  <BudgetCategoryForm 
    onSave={async (categoryData) => {
      await updateBudgetCategory(editingCategory.id, categoryData);
      setEditingCategory(null);
    }}
    editingCategory={editingCategory}
    onCancel={() => setEditingCategory(null)}
  />
)}

{editingGoal && (
  <FinancialGoalForm 
    onSave={async (goalData) => {
      await updateFinancialGoal(editingGoal.id, goalData);
      setEditingGoal(null);
    }}
    editingGoal={editingGoal}
    onCancel={() => setEditingGoal(null)}
  />
)}
    </div>
  );
}