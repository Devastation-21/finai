"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
// Removed direct database imports - now using API routes

export interface BudgetCategory {
  id: string;
  user_id: string;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  period: 'weekly' | 'monthly' | 'yearly';  // This should match DB schema
  alert_threshold: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  goal_type: 'savings' | 'debt_payment' | 'investment' | 'purchase' | 'emergency_fund' | 'other';
  priority: 'low' | 'medium' | 'high';
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetAlert {
  id: string;
  user_id: string;
  budget_category_id?: string;
  alert_type: 'threshold_reached' | 'over_budget' | 'goal_achieved' | 'deadline_approaching';
  message: string;
  is_read: boolean;
  created_at: string;
  budget_categories?: {
    category_name: string;
  };
}

export function useBudgetData() {
  const { user, isLoaded } = useUser();
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [categoriesResponse, goalsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/budget-categories?clerk_user_id=${user.id}`),
        fetch(`/api/financial-goals?clerk_user_id=${user.id}`),
        fetch(`/api/budget-alerts?clerk_user_id=${user.id}`)
      ]);

      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch budget categories');
      }
      if (!goalsResponse.ok) {
        throw new Error('Failed to fetch financial goals');
      }
      if (!alertsResponse.ok) {
        throw new Error('Failed to fetch budget alerts');
      }

      const [categories, goals, alerts] = await Promise.all([
        categoriesResponse.json(),
        goalsResponse.json(),
        alertsResponse.json()
      ]);

      setBudgetCategories(categories);
      setFinancialGoals(goals);
      setBudgetAlerts(alerts);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchBudgetData();
    }
  }, [isLoaded, user?.id]);

  const addBudgetCategory = async (categoryData: Omit<BudgetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const response = await fetch('/api/budget-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_user_id: user.id,
          ...categoryData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create budget category');
      }

      const newCategory = await response.json();
      setBudgetCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      console.error('Error creating budget category:', err);
      throw err;
    }
  };

  const updateBudgetCategoryById = async (categoryId: string, updates: Partial<BudgetCategory>) => {
    try {
      const response = await fetch(`/api/budget-categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update budget category');
      }

      const updatedCategory = await response.json();
      setBudgetCategories(prev => 
        prev.map(cat => cat.id === categoryId ? updatedCategory : cat)
      );
      return updatedCategory;
    } catch (err) {
      console.error('Error updating budget category:', err);
      throw err;
    }
  };

  const removeBudgetCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/budget-categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete budget category');
      }

      setBudgetCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (err) {
      console.error('Error deleting budget category:', err);
      throw err;
    }
  };

  const addFinancialGoal = async (goalData: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const response = await fetch('/api/financial-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_user_id: user.id,
          ...goalData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create financial goal');
      }

      const newGoal = await response.json();
      setFinancialGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      console.error('Error creating financial goal:', err);
      throw err;
    }
  };

  const updateFinancialGoalById = async (goalId: string, updates: Partial<FinancialGoal>) => {
    try {
      const response = await fetch(`/api/financial-goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update financial goal');
      }

      const updatedGoal = await response.json();
      setFinancialGoals(prev => 
        prev.map(goal => goal.id === goalId ? updatedGoal : goal)
      );
      return updatedGoal;
    } catch (err) {
      console.error('Error updating financial goal:', err);
      throw err;
    }
  };

  const removeFinancialGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/financial-goals/${goalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete financial goal');
      }

      setFinancialGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (err) {
      console.error('Error deleting financial goal:', err);
      throw err;
    }
  };

  const markAlertAsReadById = async (alertId: string) => {
    try {
      const response = await fetch(`/api/budget-alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark alert as read');
      }

      setBudgetAlerts(prev => 
        prev.map(alert => alert.id === alertId ? { ...alert, is_read: true } : alert)
      );
    } catch (err) {
      console.error('Error marking alert as read:', err);
      throw err;
    }
  };

  const sendBudgetAlert = async (alertType: 'threshold_reached' | 'over_budget' | 'goal_achieved' | 'deadline_approaching', budgetCategoryId?: string, goalId?: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const response = await fetch('/api/budget-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertType,
          budgetCategoryId,
          goalId,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send budget alert');
      }

      return await response.json();
    } catch (err) {
      console.error('Error sending budget alert:', err);
      throw err;
    }
  };

  return {
    budgetCategories,
    financialGoals,
    budgetAlerts,
    loading,
    error,
    refreshData: fetchBudgetData,
    addBudgetCategory,
    updateBudgetCategory: updateBudgetCategoryById,
    deleteBudgetCategory: removeBudgetCategory,
    addFinancialGoal,
    updateFinancialGoal: updateFinancialGoalById,
    deleteFinancialGoal: removeFinancialGoal,
    markAlertAsRead: markAlertAsReadById,
    sendBudgetAlert
  };
}
