# 🚀 Supabase Setup Guide for FinAI

## 📋 Current Status

### ✅ **Already Implemented:**
- Complete database schema with RLS policies
- Full CRUD operations for all entities
- React hooks for data management
- UI components integrated with database
- Real-time subscriptions ready
- Financial analytics functions

### ❌ **Missing (Causing Current Error):**
- Supabase project setup
- Environment variables
- Database tables creation
- Authentication integration

---

## 🛠️ Step-by-Step Implementation

### **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `finai-webapp`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

### **Step 2: Get API Keys**

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Key** (anon/public key)

### **Step 3: Configure Environment Variables**

Create a `.env.local` file in your project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role (for webhooks)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Step 4: Create Database Tables**

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. Verify tables are created in **Table Editor**

**Note**: The RLS policies are temporarily disabled for initial setup. This allows the app to work immediately while you set up Clerk authentication.

### **Step 5: Configure Row Level Security (Optional for Development)**

For development, RLS policies are temporarily disabled to allow immediate testing. For production:

1. Run the `supabase-rls-policies.sql` file in SQL Editor
2. This will create basic RLS policies that allow all access
3. Later, you can update these to use proper Clerk JWT validation

**Important**: In production, you should implement proper user isolation using Clerk JWT tokens.

### **Step 6: Set Up Clerk Integration**

1. In Clerk dashboard, go to **Webhooks**
2. Add webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Copy the webhook secret
4. Add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### **Step 7: Test the Integration**

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test the following:
   - ✅ User registration/login
   - ✅ Dashboard loads without errors
   - ✅ Add/edit/delete transactions
   - ✅ File upload functionality
   - ✅ Real-time data updates

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"supabaseUrl is required" error**:
   - Check `.env.local` file exists
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
   - Restart development server

2. **RLS Policy errors**:
   - Ensure Clerk user ID matches the JWT token
   - Check policy syntax in Supabase dashboard

3. **Database connection issues**:
   - Verify API keys are correct
   - Check Supabase project is active
   - Ensure tables are created

### **Verification Checklist:**

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database tables created
- [ ] RLS policies active
- [ ] Clerk webhook configured
- [ ] App runs without errors
- [ ] User can sign up/login
- [ ] Dashboard loads with real data
- [ ] Transactions can be added/edited/deleted

---

## 🎯 **Expected Results**

After completing setup:

1. **Authentication**: Users can sign up/login with Clerk
2. **Data Persistence**: All data is stored in Supabase
3. **Real-time Updates**: Changes appear instantly
4. **Security**: Each user sees only their data
5. **Performance**: Fast queries with proper indexing

---

## 📚 **Next Steps After Setup**

1. **File Storage**: Implement Supabase Storage for file uploads
2. **Advanced Analytics**: Add more financial calculations
3. **Real-time Notifications**: Push notifications for insights
4. **Data Export**: Export financial reports
5. **Mobile App**: React Native version

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or [Clerk Documentation](https://clerk.com/docs).
