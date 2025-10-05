-- Fix numeric precision for amount fields
-- The current precision is too small for large transaction amounts

-- Update transactions table amount column
ALTER TABLE transactions 
ALTER COLUMN amount TYPE NUMERIC(15,2);

-- Update financial_metrics table columns
ALTER TABLE financial_metrics 
ALTER COLUMN total_income TYPE NUMERIC(15,2);

ALTER TABLE financial_metrics 
ALTER COLUMN total_expenses TYPE NUMERIC(15,2);

ALTER TABLE financial_metrics 
ALTER COLUMN savings TYPE NUMERIC(15,2);

-- Update uploaded_files table file_size column (if needed)
ALTER TABLE uploaded_files 
ALTER COLUMN file_size TYPE BIGINT;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale 
FROM information_schema.columns 
WHERE table_name IN ('transactions', 'financial_metrics', 'uploaded_files')
  AND column_name IN ('amount', 'total_income', 'total_expenses', 'savings', 'file_size');

