// Standardized transaction and budget categories
export const TRANSACTION_CATEGORIES = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Gas",
  "Rent",
  "Insurance",
  "Salary",
  "Investments",
  "Other Income",
  "Other Expense"
] as const;

// Categories that are typically for expenses (for budget tracking)
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Gas",
  "Rent",
  "Insurance",
  "Other Expense"
] as const;

// Categories that are typically for income
export const INCOME_CATEGORIES = [
  "Salary",
  "Investments",
  "Other Income"
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];

