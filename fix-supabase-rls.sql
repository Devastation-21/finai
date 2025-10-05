-- Quick fix for Supabase RLS issues
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files DISABLE ROW LEVEL SECURITY;

-- Test if tables are accessible
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as transaction_count FROM transactions;
SELECT COUNT(*) as metrics_count FROM financial_metrics;
SELECT COUNT(*) as files_count FROM uploaded_files;

-- If the above works, re-enable RLS with permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on financial_metrics" ON financial_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on uploaded_files" ON uploaded_files FOR ALL USING (true) WITH CHECK (true);

