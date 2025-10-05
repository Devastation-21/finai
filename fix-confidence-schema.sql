-- Fix confidence column type to INTEGER
ALTER TABLE transactions ALTER COLUMN confidence TYPE INTEGER;

-- Update any existing decimal values to integers
UPDATE transactions 
SET confidence = ROUND(confidence * 100) 
WHERE confidence < 1;

-- Drop existing constraint if it exists
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_confidence_check;

-- Add check constraint for 0-100 range
ALTER TABLE transactions 
ADD CONSTRAINT transactions_confidence_check 
CHECK (confidence >= 0 AND confidence <= 100);
