-- RLS Policies for Development
-- These policies allow full access for development purposes

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view own financial metrics" ON financial_metrics;
DROP POLICY IF EXISTS "Users can insert own financial metrics" ON financial_metrics;
DROP POLICY IF EXISTS "Users can update own financial metrics" ON financial_metrics;

DROP POLICY IF EXISTS "Users can view own uploaded files" ON uploaded_files;
DROP POLICY IF EXISTS "Users can insert own uploaded files" ON uploaded_files;
DROP POLICY IF EXISTS "Users can update own uploaded files" ON uploaded_files;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on financial_metrics" ON financial_metrics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on uploaded_files" ON uploaded_files
  FOR ALL USING (true) WITH CHECK (true);

-- Note: These policies allow full access for development
-- In production, replace with proper user-specific policies
