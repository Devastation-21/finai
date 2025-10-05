import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/email';
import { sendBudgetAlertEmail, BudgetAlertData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update budget spent amounts and check for alerts
    await updateBudgetSpentAmounts(userId);
    await checkBudgetThresholds(userId);
    await checkFinancialGoals(userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Budget alerts checked successfully' 
    });

  } catch (error) {
    console.error('Error in check-budget-alerts API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function updateBudgetSpentAmounts(userId: string): Promise<void> {
  try {
    // Get all budget categories for the user
    const { data: categories, error: categoriesError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', userId);

    if (categoriesError) {
      console.error('Error fetching budget categories:', categoriesError);
      return;
    }

    if (!categories || categories.length === 0) {
      return;
    }

    // Get current month's transactions
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lt('date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return;
    }

    // Calculate spent amounts for each category
    for (const category of categories) {
      const categoryTransactions = transactions?.filter(t => 
        t.category === category.category_name || 
        t.category.toLowerCase() === category.category_name.toLowerCase()
      ) || [];
      const spentAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Update the spent amount in the budget category
      const { error: updateError } = await supabase
        .from('budget_categories')
        .update({ spent_amount: spentAmount })
        .eq('id', category.id);

      if (updateError) {
        console.error(`Error updating spent amount for category ${category.category_name}:`, updateError);
      }
    }

  } catch (error) {
    console.error('Error updating budget spent amounts:', error);
  }
}

async function checkBudgetThresholds(userId: string): Promise<void> {
  try {
    // Get all budget categories for the user
    const { data: categories, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching budget categories:', error);
      return;
    }

    if (!categories || categories.length === 0) {
      return; // No budget categories to check
    }

    // Check each category for threshold violations
    for (const category of categories) {
      const percentage = (category.spent_amount / category.budget_amount) * 100;
      
      // Check if we need to send an alert
      if (percentage >= 100) {
        // Over budget alert
        await sendBudgetAlert('over_budget', category.id, userId);
      } else if (percentage >= category.alert_threshold) {
        // Threshold reached alert (e.g., 80%)
        await sendBudgetAlert('threshold_reached', category.id, userId);
      }
    }
  } catch (error) {
    console.error('Error checking budget thresholds:', error);
  }
}

async function checkFinancialGoals(userId: string): Promise<void> {
  try {
    // Get all financial goals for the user
    const { data: goals, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching financial goals:', error);
      return;
    }

    if (!goals || goals.length === 0) {
      return; // No goals to check
    }

    // Check each goal
    for (const goal of goals) {
      const percentage = (goal.current_amount / goal.target_amount) * 100;
      
      // Check if goal is achieved
      if (percentage >= 100) {
        await sendBudgetAlert('goal_achieved', undefined, userId, goal.id);
      } else if (goal.deadline) {
        // Check if deadline is approaching (within 7 days)
        const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7 && daysLeft > 0) {
          await sendBudgetAlert('deadline_approaching', undefined, userId, goal.id);
        }
      }
    }
  } catch (error) {
    console.error('Error checking financial goals:', error);
  }
}

async function sendBudgetAlert(
  alertType: 'threshold_reached' | 'over_budget' | 'goal_achieved' | 'deadline_approaching',
  budgetCategoryId?: string,
  userId?: string,
  goalId?: string
): Promise<void> {
  try {
    if (!userId) {
      console.error('No userId provided for budget alert');
      return;
    }

    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found for budget alert:', userError);
      return;
    }

    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    const userEmail = user.email;

    let alertData: BudgetAlertData;

    if (alertType === 'over_budget' || alertType === 'threshold_reached') {
      if (!budgetCategoryId) {
        console.error('Budget category ID required for budget alerts');
        return;
      }

      // Get budget category information
      const { data: category, error: categoryError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('id', budgetCategoryId)
        .single();

      if (categoryError || !category) {
        console.error('Budget category not found:', categoryError);
        return;
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
      if (!goalId) {
        console.error('Goal ID required for goal alerts');
        return;
      }

      // Get financial goal information
      const { data: goal, error: goalError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (goalError || !goal) {
        console.error('Financial goal not found:', goalError);
        return;
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
      console.error('Invalid alert type:', alertType);
      return;
    }

    // Send the email directly
    const emailSent = await sendBudgetAlertEmail(alertData);
    
    if (emailSent) {
      console.log(`✅ Budget alert sent: ${alertType}`);
    } else {
      console.error(`❌ Failed to send budget alert: ${alertType}`);
    }
  } catch (error) {
    console.error('Error sending budget alert:', error);
  }
}
