"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export function EmailTestButton() {
  const { sendBudgetAlert, budgetCategories, financialGoals } = useBudgetData();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const testEmail = async (alertType: 'threshold_reached' | 'over_budget' | 'goal_achieved' | 'deadline_approaching') => {
    setIsLoading(true);
    setLastSent(null);

    try {
      let budgetCategoryId: string | undefined;
      let goalId: string | undefined;

      if (alertType === 'threshold_reached' || alertType === 'over_budget') {
        budgetCategoryId = budgetCategories[0]?.id;
        if (!budgetCategoryId) {
          throw new Error('No budget categories found. Please create a budget category first.');
        }
      } else if (alertType === 'goal_achieved' || alertType === 'deadline_approaching') {
        goalId = financialGoals[0]?.id;
        if (!goalId) {
          throw new Error('No financial goals found. Please create a financial goal first.');
        }
      }

      // Call the API directly instead of using the hook
      const response = await fetch('/api/budget-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertType,
          budgetCategoryId,
          goalId,
          userId: budgetCategories[0]?.user_id || financialGoals[0]?.user_id // Use the database user ID
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send test email');
      }

      setLastSent(alertType);
    } catch (error) {
      console.error('Error sending test email:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to send email'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'threshold_reached': return 'Budget Warning';
      case 'over_budget': return 'Over Budget Alert';
      case 'goal_achieved': return 'Goal Achieved';
      case 'deadline_approaching': return 'Deadline Reminder';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Test Email Notifications</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => testEmail('threshold_reached')}
          disabled={isLoading || budgetCategories.length === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Budget Warning
        </Button>
        
        <Button
          onClick={() => testEmail('over_budget')}
          disabled={isLoading || budgetCategories.length === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Over Budget
        </Button>
        
        <Button
          onClick={() => testEmail('goal_achieved')}
          disabled={isLoading || financialGoals.length === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Goal Achieved
        </Button>
        
        <Button
          onClick={() => testEmail('deadline_approaching')}
          disabled={isLoading || financialGoals.length === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Deadline Reminder
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Sending email...
        </div>
      )}

      {lastSent && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          {getAlertTypeLabel(lastSent)} email sent successfully!
        </div>
      )}

      {budgetCategories.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          Create a budget category to test budget alerts
        </div>
      )}

      {financialGoals.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          Create a financial goal to test goal alerts
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>Note: Emails are currently logged to console. In production, they would be sent via email service.</p>
      </div>
    </div>
  );
}
