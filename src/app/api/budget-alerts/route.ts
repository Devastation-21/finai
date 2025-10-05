import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBudgetAlertEmail, BudgetAlertData } from '@/lib/email';

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

    // Get budget alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('budget_alerts')
      .select(`
        *,
        budget_categories (
          category_name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (alertsError) {
      console.error('Error fetching budget alerts:', alertsError);
      return NextResponse.json({ error: 'Failed to fetch budget alerts' }, { status: 500 });
    }

    return NextResponse.json(alerts || []);
  } catch (error) {
    console.error('Error in budget alerts GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { alertType, budgetCategoryId, goalId, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    const userEmail = user.email;

    let alertData: BudgetAlertData;

    if (alertType === 'over_budget' || alertType === 'threshold_reached') {
      // Get budget category information
      const { data: category, error: categoryError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('id', budgetCategoryId)
        .single();

      if (categoryError || !category) {
        return NextResponse.json({ error: 'Budget category not found' }, { status: 404 });
      }

      const percentage = (category.spent_amount / category.budget_amount) * 100;

      alertData = {
        userEmail,
        userName,
        categoryName: category.category_name,
        budgetAmount: category.budget_amount,
        spentAmount: category.spent_amount,
        percentage,
        alertType
      };
    } else if (alertType === 'goal_achieved' || alertType === 'deadline_approaching') {
      // Get financial goal information
      const { data: goal, error: goalError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (goalError || !goal) {
        return NextResponse.json({ error: 'Financial goal not found' }, { status: 404 });
      }

      const daysLeft = goal.deadline 
        ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      alertData = {
        userEmail,
        userName,
        categoryName: '', // Not used for goal alerts
        budgetAmount: 0, // Not used for goal alerts
        spentAmount: 0, // Not used for goal alerts
        percentage: 0, // Not used for goal alerts
        alertType,
        goalTitle: goal.title,
        goalTarget: goal.target_amount,
        goalCurrent: goal.current_amount,
        daysLeft
      };
    } else {
      return NextResponse.json({ error: 'Invalid alert type' }, { status: 400 });
    }

    // Send the email
    const emailSent = await sendBudgetAlertEmail(alertData);

    if (emailSent) {
      // Create a record in the budget_alerts table
      await supabase
        .from('budget_alerts')
        .insert({
          user_id: userId,
          budget_category_id: budgetCategoryId || null,
          alert_type: alertType,
          message: generateAlertMessage(alertData),
          is_read: false
        });

      return NextResponse.json({ 
        success: true, 
        message: 'Budget alert email sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send email' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in budget alerts POST:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function generateAlertMessage(alertData: BudgetAlertData): string {
  switch (alertData.alertType) {
    case 'over_budget':
      return `You've exceeded your ${alertData.categoryName} budget by ₹${(alertData.spentAmount - alertData.budgetAmount).toLocaleString('en-IN')}`;
    case 'threshold_reached':
      return `You've reached ${alertData.percentage.toFixed(1)}% of your ${alertData.categoryName} budget`;
    case 'goal_achieved':
      return `Congratulations! You've achieved your ${alertData.goalTitle} goal`;
    case 'deadline_approaching':
      return `Your ${alertData.goalTitle} goal deadline is approaching in ${alertData.daysLeft} days`;
    default:
      return 'Budget alert notification';
  }
}