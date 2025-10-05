import { createClient } from '@supabase/supabase-js'
import { BudgetCategory, FinancialGoal } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

function checkSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }
}

async function getUserByClerkId(clerk_user_id: string) {
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .single()

  if (error) {
    console.log('Error fetching user by clerk_user_id:', error)
    return null
  }

  return data
}

// Budget Management Functions
export async function getBudgetCategories(clerk_user_id: string) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return []
  }

  const { data, error } = await supabase!
    .from('budget_categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createBudgetCategory(clerk_user_id: string, category: Omit<BudgetCategory, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    throw new Error('User not found')
  }

  const { data, error } = await supabase!
    .from('budget_categories')
    .insert([{
      ...category,
      user_id: user.id
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBudgetCategory(categoryId: string, updates: Partial<BudgetCategory>) {
  checkSupabase()

  const { data, error } = await supabase!
    .from('budget_categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBudgetCategory(categoryId: string) {
  checkSupabase()

  const { error } = await supabase!
    .from('budget_categories')
    .delete()
    .eq('id', categoryId)

  if (error) throw error
}

// Financial Goals Functions
export async function getFinancialGoals(clerk_user_id: string) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return []
  }

  const { data, error } = await supabase!
    .from('financial_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createFinancialGoal(clerk_user_id: string, goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    throw new Error('User not found')
  }

  const { data, error } = await supabase!
    .from('financial_goals')
    .insert([{
      ...goal,
      user_id: user.id
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFinancialGoal(goalId: string, updates: Partial<FinancialGoal>) {
  checkSupabase()

  const { data, error } = await supabase!
    .from('financial_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFinancialGoal(goalId: string) {
  checkSupabase()

  const { error } = await supabase!
    .from('financial_goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
}

// Budget Alerts Functions
export async function getBudgetAlerts(clerk_user_id: string) {
  checkSupabase()

  // First get the user's database ID
  const user = await getUserByClerkId(clerk_user_id)
  if (!user) {
    console.log('User not found for clerk_user_id:', clerk_user_id)
    return []
  }

  const { data, error } = await supabase!
    .from('budget_alerts')
    .select(`
      *,
      budget_categories (
        category_name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function markAlertAsRead(alertId: string) {
  checkSupabase()

  const { error } = await supabase!
    .from('budget_alerts')
    .update({ is_read: true })
    .eq('id', alertId)

  if (error) throw error
}

