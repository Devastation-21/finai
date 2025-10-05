// Simple test to check Supabase connection
import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    if (!supabase) {
      throw new Error('Supabase client is null - check environment variables')
    }

    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`)
    }

    console.log('✅ Supabase connection successful!')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

