# FinAI - Personal Finance Management App

A comprehensive AI-powered personal finance management application built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- Git installed
- A Supabase account (free)
- A Clerk account (free)
- A Groq API key (free)

### 1. Environment Setup

1. **Extract the zip file** to your desired location
2. **Open terminal/command prompt** in the project folder
3. **Install dependencies:**
   ```bash
   npm install
   ```

### 2. Database Setup (Supabase)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema:**
   - Go to your Supabase dashboard → SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to create all tables and policies

### 3. Authentication Setup (Clerk)

1. **Create a Clerk account** at [clerk.com](https://clerk.com)
2. **Create a new application** in Clerk dashboard
3. **Copy your Clerk keys** to the `.env.local` file

### 4. AI Setup (Groq)

1. **Get a free API key** from [console.groq.com](https://console.groq.com)
2. **Add your Groq API key** to the `.env.local` file

### 5. Environment Variables

Create a `.env.local` file with these variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq AI API
GROQ_API_KEY=your_groq_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
finai-webapp/
├── src/
│   ├── app/                 # Next.js 15 App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── hooks/               # Custom React hooks
├── samples/                 # Sample CSV files for testing
├── public/                  # Static assets
└── docs/                    # Documentation files
```

## 🎯 Key Features

### 💰 Financial Management
- **Transaction Tracking** - Upload CSV/Excel files or add manually
- **AI Categorization** - Automatic transaction categorization using Groq AI
- **Budget Management** - Set budgets and get alerts
- **Financial Goals** - Track savings and investment goals

### 📊 Analytics & Insights
- **Interactive Charts** - Spending trends, category breakdowns
- **ML Predictions** - Future spending forecasts using machine learning
- **Financial Health Score** - Overall financial wellness assessment
- **Pattern Recognition** - Identify spending patterns and trends

### 🤖 AI Features
- **Smart Categorization** - AI-powered transaction classification
- **Predictive Analytics** - Machine learning spending predictions
- **AI Chat Assistant** - Financial advice and insights
- **Automated Insights** - Personalized financial recommendations

### 🔔 Smart Alerts
- **Budget Alerts** - Email notifications for budget thresholds
- **Goal Reminders** - Track progress towards financial goals
- **Spending Warnings** - Alerts for unusual spending patterns

## 🧪 Testing the App

### Sample Data
- Use the CSV files in the `samples/` folder to test the application
- Each file represents different financial scenarios
- Upload any CSV file to see AI categorization in action

### Test Scenarios
1. **Upload sample-transactions-1.csv** - Basic daily expenses
2. **Set budget limits** - Test budget alert system
3. **Check analytics** - View spending patterns and predictions
4. **Try AI chat** - Ask questions about your finances

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify Supabase URL and keys
   - Check if RLS policies are properly set

2. **Authentication Issues**
   - Verify Clerk keys and URLs
   - Check if webhooks are configured

3. **AI Categorization Not Working**
   - Verify Groq API key
   - Check API rate limits

4. **Email Not Sending**
   - Configure SMTP settings
   - Use Gmail App Password for authentication

## 📚 Documentation

- `SUPABASE_SETUP.md` - Detailed Supabase configuration
- `CLERK_WEBHOOK_SETUP.md` - Clerk webhook setup
- `GROQ_SETUP.md` - Groq API configuration
- `EMAIL_SETUP.md` - Email service setup
- `ML_IMPLEMENTATION.md` - Machine learning features

## 🎨 Customization

### Themes
- Built-in dark/light mode support
- Customizable color schemes
- Responsive design for all devices

### Categories
- Modify transaction categories in `src/lib/categories.ts`
- Add new budget categories
- Customize AI prompts

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the documentation files
3. Check console for error messages
4. Verify all environment variables

## 🎉 Enjoy Your FinAI App!

This is a complete personal finance management solution with AI-powered insights. Perfect for learning modern web development, AI integration, and financial technology.

**Happy coding! 🚀**

