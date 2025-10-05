"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  createUser, 
  getUserByClerkId, 
  getTransactions, 
  getFinancialMetrics,
  getSpendingByCategory 
} from '@/lib/database';
import { Transaction, FinancialMetrics, SpendingCategory } from '@/types';

export function useUserData() {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<unknown>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !clerkUser) {
      setLoading(false);
      return;
    }

    const initializeUser = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Starting user initialization...', {
          clerkUserId: clerkUser.id,
          clerkEmail: clerkUser.emailAddresses[0]?.emailAddress
        });

        // Get or create user in Supabase
        console.log('Looking up user in Supabase...');
        let dbUser = await getUserByClerkId(clerkUser.id);
        console.log('User lookup result:', dbUser);
        
        if (!dbUser) {
          console.log('User not found, creating new user...');
          dbUser = await createUser({
            clerk_user_id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            first_name: clerkUser.firstName || null,
            last_name: clerkUser.lastName || null,
          });
          console.log('User created successfully:', dbUser);
        }

        setUser(dbUser);

        // Load user's financial data
        console.log('Loading financial data for user:', dbUser.id);
        const [transactionsData, metricsData, categoriesData] = await Promise.all([
          getTransactions(clerkUser.id),
          getFinancialMetrics(clerkUser.id),
          getSpendingByCategory(clerkUser.id)
        ]);
        
        console.log('Financial data loaded:', {
          transactions: transactionsData?.length || 0,
          metrics: metricsData ? 'found' : 'none',
          categories: categoriesData?.length || 0,
          transactionsData: transactionsData
        });

        setTransactions(transactionsData || []);
        
        // Transform financial metrics to match the expected interface
        if (metricsData) {
          const transformedMetrics = {
            totalIncome: metricsData.total_income || 0,
            totalExpenses: metricsData.total_expenses || 0,
            savings: metricsData.savings || 0,
            savingsRate: metricsData.total_income > 0 ? (metricsData.savings / metricsData.total_income) * 100 : 0,
            healthScore: metricsData.health_score || 0,
            incomeTrend: 'stable' as const, // We can add trend calculation later
            expenseTrend: 'stable' as const, // We can add trend calculation later
          };
          setFinancialMetrics(transformedMetrics);
        } else {
          setFinancialMetrics(null);
        }
        
        setSpendingCategories(categoriesData || []);

      } catch (err) {
        console.error('Error initializing user data:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          clerkUser: clerkUser ? { id: clerkUser.id, email: clerkUser.emailAddresses[0]?.emailAddress } : null
        });
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [isLoaded, clerkUser]);

  const refreshData = async () => {
    if (!user) return;

    try {
      setError(null);
      
      const [transactionsData, metricsData, categoriesData] = await Promise.all([
        getTransactions(clerkUser!.id),
        getFinancialMetrics(clerkUser!.id),
        getSpendingByCategory(clerkUser!.id)
      ]);

      setTransactions(transactionsData || []);
      
      // Transform financial metrics to match the expected interface
      if (metricsData) {
        const transformedMetrics = {
          totalIncome: metricsData.total_income || 0,
          totalExpenses: metricsData.total_expenses || 0,
          savings: metricsData.savings || 0,
          savingsRate: metricsData.total_income > 0 ? (metricsData.savings / metricsData.total_income) * 100 : 0,
          healthScore: metricsData.health_score || 0,
          incomeTrend: 'stable' as const, // We can add trend calculation later
          expenseTrend: 'stable' as const, // We can add trend calculation later
        };
        setFinancialMetrics(transformedMetrics);
      } else {
        setFinancialMetrics(null);
      }
      
      setSpendingCategories(categoriesData || []);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  };

  return {
    user,
    transactions,
    financialMetrics,
    spendingCategories,
    loading,
    error,
    refreshData,
    isAuthenticated: !!clerkUser && !!user
  };
}
