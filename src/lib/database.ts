import { supabase } from './supabase'
import { Transaction, FinancialMetrics, User, UploadedFile } from '@/types'

// Helper function to check if Supabase is configured
function checkSupabase() {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }
  
  // Check if we're using dummy values (build-time fallback)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'https://dummy.supabase.co') {
    console.warn('Supabase not properly configured. Some features may not work.');
    return false;
  }
  
  return true;
}

// User Management
export async function createUser(userData: {
  clerk_user_id: string
  email: string
  first_name?: string
  last_name?: string
}) {
  checkSupabase()

  console.log('Creating user with data:', userData)

  const { data, error } = await supabase!
    .from('users')
    .insert([userData])
    .select()
    .single()

  console.log('Create user result:', { data, error })

  if (error) {
    console.error('Create user error:', error)
    throw error
  }
  return data
}

export async function getUserByClerkId(clerk_user_id: string) {
  checkSupabase()

  console.log('Querying users table for clerk_user_id:', clerk_user_id)
  
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .single()

  console.log('User query result:', { data, error })

  if (error && error.code !== 'PGRST116') {
    console.error('User query error:', error)
    throw error
  }
  return data
}

export async function getUserById(user_id: string) {
  checkSupabase()

  console.log('Querying users table for user_id:', user_id)
  
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single()

  console.log('User by ID query result:', { data, error })

  if (error && error.code !== 'PGRST116') {
    console.error('User by ID query error:', error)
    throw error
  }
  return data
}

export async function updateUser(user_id: string, updates: Partial<User>) {
  checkSupabase()

  const { data, error } = await supabase!
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user_id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Create user from Clerk ID (fallback when user doesn't exist in database)
async function createUserFromClerkId(clerk_user_id: string) {
  checkSupabase()
  
  console.log('Creating user for clerk_user_id:', clerk_user_id)
  
  // Create a basic user record with minimal data
  const { data, error } = await supabase!
    .from('users')
    .insert([{
      clerk_user_id: clerk_user_id,
      email: 'user@example.com', // Placeholder email
      first_name: 'User',
      last_name: 'Name',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  console.log('✅ User created in database:', data)
  return data
}

// Transaction Management
export async function createTransaction(clerk_user_id: string, transaction: Omit<Transaction, 'id'>) {
  checkSupabase()

  // First get the user's database ID
  let user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    console.log('Attempting to create user automatically...')
    
    // Try to create the user automatically
    try {
      user = await createUserFromClerkId(clerk_user_id)
      if (!user) {
        throw new Error('Failed to create user')
      }
      console.log('✅ User created successfully:', user.id)
    } catch (createError) {
      console.error('❌ Failed to create user:', createError)
      throw new Error('User not found and could not be created')
    }
  }

  const { data, error } = await supabase!
    .from('transactions')
    .insert([{
      ...transaction,
      user_id: user.id
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    console.error('Transaction data:', {
      ...transaction,
      user_id: user.id
    })
    throw error
  }

  // If it's an expense transaction, trigger budget alert check via API
  if (transaction.type === 'expense') {
    try {
      // Call the budget alert API endpoint
      await fetch('/api/check-budget-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (alertError) {
      console.error('Error checking budget alerts:', alertError);
      // Don't throw error here - transaction was created successfully
    }
  }

  return data
}

export async function getTransactions(clerk_user_id: string, limit = 50) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return []
  }

  const { data, error } = await supabase!
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getTransactionsByDateRange(clerk_user_id: string, start_date: string, end_date: string) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return []
  }

  const { data, error } = await supabase!
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', start_date)
    .lte('date', end_date)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  checkSupabase()

  const { data, error } = await supabase!
    .from('transactions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTransaction(id: string) {
  checkSupabase()

  const { error } = await supabase!
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Financial Metrics
export async function createFinancialMetrics(metrics: Omit<FinancialMetrics, 'id'>) {
  checkSupabase()
  
  const { data, error } = await supabase!
    .from('financial_metrics')
    .insert([metrics])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getFinancialMetrics(clerk_user_id: string, month?: string, year?: number) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return null
  }

  // Get all transactions for the user
  const { data: transactions, error } = await supabase!
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw error

  if (!transactions || transactions.length === 0) {
    console.log('No transactions found for user:', user.id)
    return null
  }

  // Filter by month/year if specified
  let filteredTransactions = transactions
  if (month || year) {
    filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date)
      if (month && txDate.getMonth() + 1 !== parseInt(month)) return false
      if (year && txDate.getFullYear() !== year) return false
      return true
    })
  }

  // Calculate metrics from transactions
  const incomeTransactions = filteredTransactions.filter(tx => tx.type === 'income')
  const expenseTransactions = filteredTransactions.filter(tx => tx.type === 'expense')
  
  const totalIncome = incomeTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
  const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)

  const savings = totalIncome - totalExpenses
  const healthScore = totalIncome > 0 ? Math.max(0, Math.min(100, (savings / totalIncome) * 100)) : 0

  console.log('Financial metrics calculation:', {
    totalTransactions: filteredTransactions.length,
    incomeTransactions: incomeTransactions.length,
    expenseTransactions: expenseTransactions.length,
    totalIncome,
    totalExpenses,
    savings,
    healthScore
  })

  return {
    id: 'calculated',
    user_id: user.id,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    savings: savings,
    health_score: Math.round(healthScore),
    month: month || new Date().getMonth() + 1,
    year: year || new Date().getFullYear(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export async function updateFinancialMetrics(id: string, updates: Partial<FinancialMetrics>) {
  checkSupabase()
  
  const { data, error } = await supabase!
    .from('financial_metrics')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// File Management
export async function createUploadedFile(fileData: Omit<UploadedFile, 'id' | 'created_at' | 'updated_at'>) {
  checkSupabase()

  const { data, error } = await supabase!
    .from('uploaded_files')
    .insert([fileData])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUploadedFiles(clerk_user_id: string) {
  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return []
  }

  checkSupabase()
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateFileStatus(id: string, status: UploadedFile['status'], processed_at?: string) {
  checkSupabase()

  const { data, error } = await supabase!
    .from('uploaded_files')
    .update({ 
      status, 
      processed_at: processed_at || new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Analytics Functions
export async function getSpendingByCategory(clerk_user_id: string, start_date?: string, end_date?: string) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return []
  }

  let query = supabase!
    .from('transactions')
    .select('category, amount')
    .eq('user_id', user.id)
    .eq('type', 'expense')

  if (start_date) query = query.gte('date', start_date)
  if (end_date) query = query.lte('date', end_date)

  const { data, error } = await query

  if (error) throw error

  // Group by category and calculate totals
  const categoryTotals = data?.reduce((acc, transaction) => {
    const category = transaction.category
    acc[category] = (acc[category] || 0) + transaction.amount
    return acc
  }, {} as Record<string, number>) || {}

  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

  return Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
    color: getCategoryColor(name)
  }))
}

function getCategoryColor(category: string): string {
  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#F97316", "#84CC16", "#EC4899", "#6366F1"
  ]
  
  const hash = category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

// Real-time subscriptions (disabled due to type compatibility issues)
export function subscribeToTransactions(user_id: string, callback: (transaction: Transaction) => void) {
  console.warn('Real-time subscriptions are temporarily disabled');
  return {
    unsubscribe: () => {}
  };
}

export function subscribeToFinancialMetrics(user_id: string, callback: (metrics: FinancialMetrics) => void) {
  console.warn('Real-time subscriptions are temporarily disabled');
  return {
    unsubscribe: () => {}
  };
}
