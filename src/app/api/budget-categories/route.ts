import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkUserId = searchParams.get('clerk_user_id');

    if (!clerkUserId) {
      return NextResponse.json({ error: 'clerk_user_id is required' }, { status: 400 });
    }

    // Get user by clerk_user_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get budget categories
    const { data: categories, error: categoriesError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (categoriesError) {
      console.error('Error fetching budget categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch budget categories' }, { status: 500 });
    }

    return NextResponse.json(categories || []);
  } catch (error) {
    console.error('Error in budget categories GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { clerk_user_id, ...categoryData } = await request.json();

    if (!clerk_user_id) {
      return NextResponse.json({ error: 'clerk_user_id is required' }, { status: 400 });
    }

    // Get user by clerk_user_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerk_user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create budget category
    const { data: category, error: categoryError } = await supabase
      .from('budget_categories')
      .insert([{
        ...categoryData,
        user_id: user.id
      }])
      .select()
      .single();

    if (categoryError) {
      console.error('Error creating budget category:', categoryError);
      return NextResponse.json({ error: 'Failed to create budget category' }, { status: 500 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in budget categories POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

