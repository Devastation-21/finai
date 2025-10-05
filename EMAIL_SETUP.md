# 📧 Email Setup Guide for FinAI Budget Notifications

This guide will help you set up email notifications for budget alerts in your FinAI application.

## 🚀 Quick Start

The email system is already implemented and ready to use! Currently, emails are logged to the console for development. To enable real email sending, follow the setup instructions below.

## 📋 Current Features

- ✅ **Budget Overrun Alerts** - When you exceed your budget
- ✅ **Budget Warning Alerts** - When you reach 80% of your budget
- ✅ **Goal Achievement Notifications** - When you reach a financial goal
- ✅ **Deadline Reminders** - When goal deadlines are approaching
- ✅ **Beautiful HTML Email Templates** - Professional, responsive design
- ✅ **Test Email Functionality** - Test all email types from the budget page

## 🔧 Email Provider Setup

### Option 1: Gmail SMTP (FREE - Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add to your environment variables:**
   ```bash
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```
4. **That's it!** Gmail SMTP is already configured in the code

### Option 2: Resend (Recommended for Production)

1. **Sign up at [Resend](https://resend.com)**
2. **Get your API key** from the dashboard
3. **Add to your environment variables:**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxx
   ```
4. **Uncomment the Resend code** in `src/app/api/send-email/route.ts`

### Option 2: SendGrid

1. **Sign up at [SendGrid](https://sendgrid.com)**
2. **Create an API key** in the dashboard
3. **Add to your environment variables:**
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxx
   ```
4. **Install SendGrid:**
   ```bash
   npm install @sendgrid/mail
   ```
5. **Uncomment the SendGrid code** in `src/app/api/send-email/route.ts`

### Option 3: AWS SES

1. **Set up AWS SES** in your AWS account
2. **Create IAM user** with SES permissions
3. **Add to your environment variables:**
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```
4. **Install AWS SDK:**
   ```bash
   npm install aws-sdk
   ```
5. **Uncomment the AWS SES code** in `src/app/api/send-email/route.ts`

## 🧪 Testing Email Notifications

1. **Go to the Budget page** (`/budget`)
2. **Create a budget category** (if you haven't already)
3. **Create a financial goal** (if you haven't already)
4. **Use the "Email Notifications" section** to test different alert types:
   - Budget Warning
   - Over Budget Alert
   - Goal Achieved
   - Deadline Reminder

## 📧 Email Templates

The system includes beautiful, responsive email templates for:

### 🚨 Budget Overrun Alert
- Red gradient header
- Clear budget vs. spent comparison
- Helpful tips to get back on track
- Call-to-action button to view dashboard

### ⚠️ Budget Warning Alert
- Orange gradient header
- Progress indicator
- Tips to stay on track
- Dashboard link

### 🎉 Goal Achievement
- Green gradient header
- Celebration message
- Achievement details
- Next steps suggestions

### ⏰ Deadline Reminder
- Purple gradient header
- Time-sensitive information
- Quick action suggestions
- Goal review link

## 🔧 Customization

### Modify Email Templates
Edit `src/lib/email.ts` to customize:
- Colors and styling
- Content and messaging
- Call-to-action buttons
- Footer information

### Add New Alert Types
1. **Add new alert type** to the `BudgetAlertData` interface
2. **Create email template** in `generateBudgetAlertEmail()`
3. **Update the API route** to handle the new type
4. **Add test button** in `EmailTestButton.tsx`

### Environment Variables
Add these to your `.env.local`:
```bash
# Gmail SMTP Configuration (FREE - Recommended)
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password

# OR for Production (choose one):
# RESEND_API_KEY=re_xxxxxxxxx
# SENDGRID_API_KEY=SG.xxxxxxxxx
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=AKIA...
# AWS_SECRET_ACCESS_KEY=...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## 🚀 Production Deployment

### Vercel (Recommended)
1. **Add environment variables** in Vercel dashboard
2. **Deploy your application**
3. **Test email functionality** in production

### Other Platforms
1. **Set environment variables** in your hosting platform
2. **Ensure email service is configured** correctly
3. **Test thoroughly** before going live

## 🐛 Troubleshooting

### Emails Not Sending
1. **Check console logs** for error messages
2. **Verify API keys** are correct
3. **Check email service status** (Resend/SendGrid/AWS)
4. **Verify domain authentication** (if required)

### Emails Going to Spam
1. **Set up SPF/DKIM records** for your domain
2. **Use a reputable email service**
3. **Avoid spam trigger words** in subject lines
4. **Test with different email providers**

### Template Issues
1. **Check HTML validity** in email templates
2. **Test responsive design** on different devices
3. **Verify image URLs** are accessible
4. **Test with different email clients**

## 📊 Monitoring

### Email Analytics
- **Track delivery rates** in your email service dashboard
- **Monitor open rates** and click-through rates
- **Set up alerts** for failed deliveries

### Application Logs
- **Monitor email sending logs** in your application
- **Set up error tracking** for email failures
- **Track user engagement** with budget alerts

## 🔒 Security Considerations

1. **Never expose API keys** in client-side code
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** for email sending
4. **Validate email addresses** before sending
5. **Set up proper error handling** for failed sends

## 📈 Future Enhancements

- [ ] **Email preferences** - Let users choose notification types
- [ ] **Scheduled emails** - Weekly/monthly budget summaries
- [ ] **Email templates** - Customizable email designs
- [ ] **Unsubscribe functionality** - Easy opt-out options
- [ ] **Email analytics** - Track engagement metrics
- [ ] **Multi-language support** - Localized email content

## 🆘 Support

If you encounter any issues:
1. **Check the console logs** for detailed error messages
2. **Verify your email service configuration**
3. **Test with the built-in email test functionality**
4. **Review the troubleshooting section** above

---

**Happy emailing! 📧✨**
