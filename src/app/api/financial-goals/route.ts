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

    // Get financial goals
    const { data: goals, error: goalsError } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (goalsError) {
      console.error('Error fetching financial goals:', goalsError);
      return NextResponse.json({ error: 'Failed to fetch financial goals' }, { status: 500 });
    }

    return NextResponse.json(goals || []);
  } catch (error) {
    console.error('Error in financial goals GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { clerk_user_id, ...goalData } = await request.json();

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

    // Create financial goal
    const { data: goal, error: goalError } = await supabase
      .from('financial_goals')
      .insert([{
        ...goalData,
        user_id: user.id
      }])
      .select()
      .single();

    if (goalError) {
      console.error('Error creating financial goal:', goalError);
      return NextResponse.json({ error: 'Failed to create financial goal' }, { status: 500 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error in financial goals POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

