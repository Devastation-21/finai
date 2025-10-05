export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  merchant?: string;
  type: 'income' | 'expense';
  confidence?: number;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  healthScore: number;
  incomeTrend: 'up' | 'down' | 'stable';
  expenseTrend: 'up' | 'down' | 'stable';
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface FileUploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}

export interface BudgetCategory {
  id: string;
  user_id: string;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
  updated_at: string;
}

