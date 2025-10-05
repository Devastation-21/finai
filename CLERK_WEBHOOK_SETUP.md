# 🔗 Clerk Webhook Setup Guide

## 📋 What This Does

The webhook automatically creates and updates user records in Supabase whenever someone:
- ✅ **Registers** with Clerk → Creates user in Supabase
- ✅ **Updates their profile** → Updates user in Supabase  
- ✅ **Deletes their account** → Handles user deletion

## 🛠️ Setup Steps

### **Step 1: Get Your Webhook Secret**

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your FinAI application
3. Go to **Webhooks** in the left sidebar
4. Click **"Add Endpoint"**

### **Step 2: Configure the Webhook**

1. **Endpoint URL**: `https://yourdomain.com/api/webhooks/clerk`
   - For development: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - For production: `https://yourdomain.com/api/webhooks/clerk`

2. **Events to Subscribe**:
   - ✅ `user.created`
   - ✅ `user.updated` 
   - ✅ `user.deleted`

3. **Click "Create"**

### **Step 3: Copy the Webhook Secret**

1. After creating the webhook, click on it
2. Copy the **"Signing Secret"** (starts with `whsec_`)
3. Add it to your `.env.local` file:

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Step 4: Test the Webhook (Development)**

For local development, you'll need to expose your local server:

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start your app**:
   ```bash
   npm run dev
   ```

3. **Expose local server**:
   ```bash
   ngrok http 3001
   ```

4. **Use the ngrok URL** in your Clerk webhook configuration

### **Step 5: Verify It's Working**

1. **Check the logs** in your terminal when someone registers
2. **Check Supabase** → Table Editor → `users` table
3. **Look for new user records** when someone signs up

## 🔍 Testing the Flow

### **Test User Registration**:

1. Go to `/signup` in your app
2. Create a new account
3. Check the terminal logs for:
   ```
   Webhook event received: user.created
   User created successfully: { user data }
   ```
4. Check Supabase `users` table for the new record

### **Test User Updates**:

1. Go to the dashboard
2. Click "Edit" in the User Profile section
3. Update your name or email
4. Check Supabase for the updated record

## 🚨 Troubleshooting

### **Webhook Not Receiving Events**:
- Check the webhook URL is correct
- Verify ngrok is running (for development)
- Check Clerk webhook logs for errors

### **Database Errors**:
- Ensure Supabase environment variables are set
- Check the `users` table exists
- Verify RLS policies allow inserts

### **User Not Created**:
- Check webhook secret is correct
- Look at terminal logs for error messages
- Verify the webhook endpoint is accessible

## 📊 What Gets Stored

When a user registers, this data is automatically stored in Supabase:

```json
{
  "id": "uuid-generated-by-supabase",
  "clerk_user_id": "user_abc123...",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe", 
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🎯 Next Steps

Once the webhook is working:
1. Users will be automatically created in Supabase
2. They can add transactions and financial data
3. All data will be properly linked to their user account
4. Profile updates will sync between Clerk and Supabase

**The webhook ensures your FinAI app has complete user data for financial management!** 🚀

