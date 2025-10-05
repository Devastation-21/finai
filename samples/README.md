# Sample Transaction CSV Files

This folder contains sample CSV files with realistic Indian financial transaction data for testing the FinAI web application.

## Files Overview

### 1. `sample-transactions-1.csv` - Basic Monthly Expenses
- **Period**: January 2024
- **Focus**: Daily expenses and regular spending
- **Categories**: Food & Dining, Transportation, Entertainment, Shopping
- **Total Transactions**: 15
- **Key Features**: Mix of small and medium expenses, salary income

### 2. `sample-transactions-2.csv` - Monthly Budget & Bills
- **Period**: February 2024
- **Focus**: Monthly bills and major expenses
- **Categories**: Housing, Utilities, Healthcare, Insurance, Investment
- **Total Transactions**: 15
- **Key Features**: Rent, utility bills, insurance, investments

### 3. `sample-transactions-3.csv` - Freelancer & Investment Focus
- **Period**: March 2024
- **Focus**: Freelance income and investment activities
- **Categories**: Freelance, Investment, Travel, Education, Fitness
- **Total Transactions**: 15
- **Key Features**: Freelance income, stock investments, travel expenses

### 4. `sample-transactions-4.csv` - Family Financial Management
- **Period**: April 2024
- **Focus**: Family expenses and loan payments
- **Categories**: Housing, Debt, Insurance, Education, Family
- **Total Transactions**: 15
- **Key Features**: Loan EMIs, family expenses, insurance premiums

### 5. `sample-transactions-5.csv` - Mixed Income & Small Expenses
- **Period**: May 2024
- **Focus**: Multiple income sources and small daily expenses
- **Categories**: Salary, Investment Income, Small Purchases
- **Total Transactions**: 15
- **Key Features**: Multiple income types, small daily expenses

## How to Use

1. **Upload any CSV file** to the FinAI dashboard
2. **Test different scenarios** by uploading different files
3. **Compare analytics** across different spending patterns
4. **Test budget alerts** with various expense categories

## Transaction Categories Used

### Income Categories:
- Salary
- Bonus
- Freelance
- Investment (dividends, interest)

### Expense Categories:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Utilities
- Healthcare
- Education
- Housing
- Insurance
- Investment
- Travel
- Fitness
- Charity
- Debt
- Cash

## Testing Scenarios

### Budget Alert Testing:
- Upload files with high spending in specific categories
- Set budget limits and test threshold alerts
- Test over-budget scenarios

### Analytics Testing:
- Compare spending patterns across different months
- Test ML predictions with varied data
- Analyze financial health scores

### AI Categorization Testing:
- Test automatic categorization accuracy
- Verify confidence scores
- Check category consistency

## File Format

All CSV files follow this format:
```csv
Date,Description,Amount,Category,Type
2024-01-15,Transaction Description,450.00,Category Name,Income/Expense
```

## Notes

- All amounts are in Indian Rupees (₹)
- Dates are in YYYY-MM-DD format
- Categories match the application's predefined list
- Transaction types are either "Income" or "Expense"
- Descriptions are realistic and varied for better AI training

