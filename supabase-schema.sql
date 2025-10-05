-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  merchant TEXT,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_metrics table
CREATE TABLE IF NOT EXISTS financial_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_income DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  savings DECIMAL(15,2) NOT NULL DEFAULT 0,
  savings_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100) NOT NULL DEFAULT 0,
  income_trend TEXT CHECK (income_trend IN ('up', 'down', 'stable')) NOT NULL DEFAULT 'stable',
  expense_trend TEXT CHECK (expense_trend IN ('up', 'down', 'stable')) NOT NULL DEFAULT 'stable',
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Create uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('uploading', 'processing', 'completed', 'failed')) NOT NULL DEFAULT 'uploading',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_metrics_user_id ON financial_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_metrics_month_year ON financial_metrics(month, year);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Note: These policies will be updated after Clerk integration
-- For now, we'll use a simpler approach that works with Supabase auth

-- Users can only see their own data (temporarily disabled for setup)
-- CREATE POLICY "Users can view own profile" ON users
--   FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

-- CREATE POLICY "Users can update own profile" ON users
--   FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- RLS Policies (temporarily disabled for initial setup)
-- These will be enabled after Clerk integration is complete

-- Transactions policies (commented out for now)
-- CREATE POLICY "Users can view own transactions" ON transactions
--   FOR SELECT USING (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- CREATE POLICY "Users can insert own transactions" ON transactions
--   FOR INSERT WITH CHECK (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- CREATE POLICY "Users can update own transactions" ON transactions
--   FOR UPDATE USING (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- CREATE POLICY "Users can delete own transactions" ON transactions
--   FOR DELETE USING (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- Financial metrics policies (commented out for now)
-- CREATE POLICY "Users can view own financial metrics" ON financial_metrics
--   FOR SELECT USING (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- CREATE POLICY "Users can insert own financial metrics" ON financial_metrics
--   FOR INSERT WITH CHECK (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- CREATE POLICY "Users can update own financial metrics" ON financial_metrics
--   FOR UPDATE USING (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- Uploaded files policies (commented out for now)
-- CREATE POLICY "Users can view own uploaded files" ON uploaded_files
--   FOR SELECT USING (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- CREATE POLICY "Users can insert own uploaded files" ON uploaded_files
--   FOR INSERT WITH CHECK (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- CREATE POLICY "Users can update own uploaded files" ON uploaded_files
--   FOR UPDATE USING (user_id IN (
--     SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
--   ));

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_metrics_updated_at BEFORE UPDATE ON financial_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploaded_files_updated_at BEFORE UPDATE ON uploaded_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate financial metrics
CREATE OR REPLACE FUNCTION calculate_financial_metrics(p_user_id UUID, p_month TEXT, p_year INTEGER)
RETURNS VOID AS $$
DECLARE
  v_total_income DECIMAL(15,2) := 0;
  v_total_expenses DECIMAL(15,2) := 0;
  v_savings DECIMAL(15,2) := 0;
  v_savings_rate DECIMAL(5,2) := 0;
  v_health_score INTEGER := 0;
  v_income_trend TEXT := 'stable';
  v_expense_trend TEXT := 'stable';
  v_previous_income DECIMAL(15,2) := 0;
  v_previous_expenses DECIMAL(15,2) := 0;
BEGIN
  -- Calculate current month totals
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_total_income, v_total_expenses
  FROM transactions 
  WHERE user_id = p_user_id 
    AND EXTRACT(MONTH FROM date) = p_month::INTEGER 
    AND EXTRACT(YEAR FROM date) = p_year;

  -- Calculate savings
  v_savings := v_total_income - v_total_expenses;
  
  -- Calculate savings rate
  IF v_total_income > 0 THEN
    v_savings_rate := (v_savings / v_total_income) * 100;
  END IF;

  -- Calculate health score (0-100)
  v_health_score := LEAST(100, GREATEST(0, 
    CASE 
      WHEN v_savings_rate >= 20 THEN 100
      WHEN v_savings_rate >= 15 THEN 80
      WHEN v_savings_rate >= 10 THEN 60
      WHEN v_savings_rate >= 5 THEN 40
      WHEN v_savings_rate >= 0 THEN 20
      ELSE 0
    END
  ));

  -- Get previous month data for trends
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_previous_income, v_previous_expenses
  FROM transactions 
  WHERE user_id = p_user_id 
    AND EXTRACT(MONTH FROM date) = p_month::INTEGER - 1
    AND EXTRACT(YEAR FROM date) = p_year;

  -- Calculate trends
  IF v_previous_income > 0 THEN
    v_income_trend := CASE 
      WHEN v_total_income > v_previous_income * 1.05 THEN 'up'
      WHEN v_total_income < v_previous_income * 0.95 THEN 'down'
      ELSE 'stable'
    END;
  END IF;

  IF v_previous_expenses > 0 THEN
    v_expense_trend := CASE 
      WHEN v_total_expenses > v_previous_expenses * 1.05 THEN 'up'
      WHEN v_total_expenses < v_previous_expenses * 0.95 THEN 'down'
      ELSE 'stable'
    END;
  END IF;

  -- Insert or update financial metrics
  INSERT INTO financial_metrics (
    user_id, total_income, total_expenses, savings, savings_rate, 
    health_score, income_trend, expense_trend, month, year
  ) VALUES (
    p_user_id, v_total_income, v_total_expenses, v_savings, v_savings_rate,
    v_health_score, v_income_trend, v_expense_trend, p_month, p_year
  )
  ON CONFLICT (user_id, month, year) 
  DO UPDATE SET
    total_income = EXCLUDED.total_income,
    total_expenses = EXCLUDED.total_expenses,
    savings = EXCLUDED.savings,
    savings_rate = EXCLUDED.savings_rate,
    health_score = EXCLUDED.health_score,
    income_trend = EXCLUDED.income_trend,
    expense_trend = EXCLUDED.expense_trend,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
