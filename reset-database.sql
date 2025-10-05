    -- Complete database reset for FinAI
    -- This will drop all existing tables and recreate them with proper precision

    -- Drop all existing tables (in correct order due to foreign keys)
    DROP TABLE IF EXISTS uploaded_files CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS financial_metrics CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_financial_metrics(UUID, TEXT, INTEGER) CASCADE;

    -- Create users table
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_user_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create transactions table with proper NUMERIC precision
    CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        amount NUMERIC(15,2) NOT NULL,  -- Fixed precision: 15 digits total, 2 decimal places
        date DATE NOT NULL,
        category TEXT NOT NULL,
        merchant TEXT,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create financial_metrics table with proper NUMERIC precision
    CREATE TABLE financial_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_income NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Fixed precision
        total_expenses NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Fixed precision
        savings NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Fixed precision
        savings_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        health_score INTEGER NOT NULL DEFAULT 0,
        income_trend TEXT NOT NULL DEFAULT 'stable' CHECK (income_trend IN ('up', 'down', 'stable')),
        expense_trend TEXT NOT NULL DEFAULT 'stable' CHECK (expense_trend IN ('up', 'down', 'stable')),
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create uploaded_files table
    CREATE TABLE uploaded_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        file_url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
        processed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX idx_transactions_date ON transactions(date);
    CREATE INDEX idx_transactions_category ON transactions(category);
    CREATE INDEX idx_financial_metrics_user_id ON financial_metrics(user_id);
    CREATE INDEX idx_financial_metrics_month_year ON financial_metrics(month, year);
    CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);

    -- Create function to update updated_at column
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create triggers for updated_at
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_financial_metrics_updated_at BEFORE UPDATE ON financial_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_uploaded_files_updated_at BEFORE UPDATE ON uploaded_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Create function to calculate financial metrics
    CREATE OR REPLACE FUNCTION calculate_financial_metrics(p_user_id UUID, p_month TEXT, p_year INTEGER)
    RETURNS TABLE (
        total_income NUMERIC(15,2),
        total_expenses NUMERIC(15,2),
        savings NUMERIC(15,2),
        savings_rate DECIMAL(5,2),
        health_score INTEGER
    ) AS $$
    DECLARE
        v_total_income NUMERIC(15,2) := 0;
        v_total_expenses NUMERIC(15,2) := 0;
        v_savings NUMERIC(15,2) := 0;
        v_savings_rate DECIMAL(5,2) := 0;
        v_health_score INTEGER := 0;
    BEGIN
        -- Calculate totals for the month
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END), 0)
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
        IF v_total_income > 0 THEN
            v_health_score := LEAST(100, GREATEST(0, (v_savings_rate + 50)::INTEGER));
        END IF;
        
        RETURN QUERY SELECT v_total_income, v_total_expenses, v_savings, v_savings_rate, v_health_score;
    END;
    $$ LANGUAGE plpgsql;

    -- Insert some test data to verify the schema works
    INSERT INTO users (clerk_user_id, email, first_name, last_name) 
    VALUES ('test-user-123', 'test@example.com', 'Test', 'User');

    -- Test insert with proper precision
    INSERT INTO transactions (user_id, description, amount, date, category, type)
    SELECT 
        u.id,
        'Test Transaction',
        123.45,
        '2024-01-15',
        'Test',
        'expense'
    FROM users u 
    WHERE u.clerk_user_id = 'test-user-123';

    -- Verify the data was inserted correctly
    SELECT 'Schema reset completed successfully!' as status;
    SELECT 'Test transaction amount:' as info, amount FROM transactions WHERE description = 'Test Transaction';
