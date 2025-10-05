-- Quick fix for database precision issues
-- Run this in Supabase SQL Editor

-- Fix transactions table
ALTER TABLE transactions ALTER COLUMN amount TYPE NUMERIC(15,2);

-- Fix financial_metrics table
ALTER TABLE financial_metrics ALTER COLUMN total_income TYPE NUMERIC(15,2);
ALTER TABLE financial_metrics ALTER COLUMN total_expenses TYPE NUMERIC(15,2);
ALTER TABLE financial_metrics ALTER COLUMN savings TYPE NUMERIC(15,2);

-- Verify the changes
SELECT 
  table_name,
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale 
FROM information_schema.columns 
WHERE table_name IN ('transactions', 'financial_metrics')
  AND column_name IN ('amount', 'total_income', 'total_expenses', 'savings')
ORDER BY table_name, column_name;

