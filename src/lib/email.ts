import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Gmail SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your Gmail address
      pass: process.env.SMTP_PASS, // your Gmail app password
    },
  });
};

export interface BudgetAlertEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface BudgetAlertData {
  userEmail: string;
  userName: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  alertType: 'threshold_reached' | 'over_budget' | 'goal_achieved' | 'deadline_approaching';
  goalTitle?: string;
  goalTarget?: number;
  goalCurrent?: number;
  daysLeft?: number;
}

export function generateBudgetAlertEmail(data: BudgetAlertData): BudgetAlertEmail {
  const { userEmail, userName, categoryName, budgetAmount, spentAmount, percentage, alertType, goalTitle, goalTarget, goalCurrent, daysLeft } = data;
  
  let subject: string;
  let html: string;
  let text: string;

  switch (alertType) {
    case 'over_budget':
      subject = `🚨 Budget Alert: You've exceeded your ${categoryName} budget`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🚨 Budget Exceeded</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">FinAI Budget Alert</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              You've exceeded your <strong>${categoryName}</strong> budget for this month. Here are the details:
            </p>
            
            <div style="background: #fff5f5; border-left: 4px solid #ff6b6b; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Budget Amount:</span>
                <span style="color: #333;">₹${budgetAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Amount Spent:</span>
                <span style="color: #ff6b6b; font-weight: bold;">₹${spentAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Over Budget By:</span>
                <span style="color: #ff6b6b; font-weight: bold;">₹${(spentAmount - budgetAmount).toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Percentage:</span>
                <span style="color: #ff6b6b; font-weight: bold;">${percentage.toFixed(1)}%</span>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">💡 Tips to get back on track:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Review your recent expenses in this category</li>
                <li>Consider reducing spending in other categories to compensate</li>
                <li>Set up spending alerts at 75% of your budget</li>
                <li>Track your daily spending to avoid future overruns</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/budget" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Budget Dashboard
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              This is an automated message from FinAI. Please do not reply to this email.
            </p>
          </div>
        </div>
      `;
      text = `Budget Alert: You've exceeded your ${categoryName} budget by ₹${(spentAmount - budgetAmount).toLocaleString('en-IN')}. Budget: ₹${budgetAmount.toLocaleString('en-IN')}, Spent: ₹${spentAmount.toLocaleString('en-IN')} (${percentage.toFixed(1)}%)`;
      break;

    case 'threshold_reached':
      subject = `⚠️ Budget Warning: You're at ${percentage.toFixed(1)}% of your ${categoryName} budget`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Budget Warning</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">FinAI Budget Alert</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              You've reached <strong>${percentage.toFixed(1)}%</strong> of your <strong>${categoryName}</strong> budget for this month.
            </p>
            
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Budget Amount:</span>
                <span style="color: #333;">₹${budgetAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Amount Spent:</span>
                <span style="color: #f59e0b; font-weight: bold;">₹${spentAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Remaining:</span>
                <span style="color: #059669; font-weight: bold;">₹${(budgetAmount - spentAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">💡 Tips to stay on track:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Monitor your spending more closely for the rest of the month</li>
                <li>Consider reducing non-essential expenses in this category</li>
                <li>Set up daily spending limits to avoid going over budget</li>
                <li>Review your budget allocation if this happens frequently</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/budget" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Budget Dashboard
              </a>
            </div>
          </div>
        </div>
      `;
      text = `Budget Warning: You've spent ${percentage.toFixed(1)}% of your ${categoryName} budget. Budget: ₹${budgetAmount.toLocaleString('en-IN')}, Spent: ₹${spentAmount.toLocaleString('en-IN')}, Remaining: ₹${(budgetAmount - spentAmount).toLocaleString('en-IN')}`;
      break;

    case 'goal_achieved':
      subject = `🎉 Congratulations! You've achieved your ${goalTitle} goal`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Goal Achieved!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">FinAI Financial Goals</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Congratulations ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              You've successfully achieved your financial goal: <strong>${goalTitle}</strong>
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Goal Target:</span>
                <span style="color: #333;">₹${goalTarget?.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Amount Saved:</span>
                <span style="color: #10b981; font-weight: bold;">₹${goalCurrent?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🎯 What's next?</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Celebrate this achievement! You've worked hard for this</li>
                <li>Consider setting a new, more ambitious goal</li>
                <li>Review your budget to see if you can maintain this saving rate</li>
                <li>Share your success with friends and family</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/budget" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Set New Goals
              </a>
            </div>
          </div>
        </div>
      `;
      text = `Congratulations! You've achieved your ${goalTitle} goal. Target: ₹${goalTarget?.toLocaleString('en-IN')}, Saved: ₹${goalCurrent?.toLocaleString('en-IN')}`;
      break;

    case 'deadline_approaching':
      subject = `⏰ Reminder: Your ${goalTitle} goal deadline is approaching`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⏰ Deadline Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">FinAI Financial Goals</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Your financial goal <strong>${goalTitle}</strong> deadline is approaching in <strong>${daysLeft} days</strong>.
            </p>
            
            <div style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Goal Target:</span>
                <span style="color: #333;">₹${goalTarget?.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Current Amount:</span>
                <span style="color: #8b5cf6; font-weight: bold;">₹${goalCurrent?.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold;">Remaining:</span>
                <span style="color: #dc2626; font-weight: bold;">₹${((goalTarget || 0) - (goalCurrent || 0)).toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">Days Left:</span>
                <span style="color: #8b5cf6; font-weight: bold;">${daysLeft} days</span>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">💡 Quick actions to consider:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Review your budget to see if you can increase savings</li>
                <li>Consider adjusting your goal timeline if needed</li>
                <li>Look for ways to reduce expenses in other categories</li>
                <li>Set up automatic transfers to reach your goal faster</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/budget" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review Goals
              </a>
            </div>
          </div>
        </div>
      `;
      text = `Deadline Reminder: Your ${goalTitle} goal deadline is in ${daysLeft} days. Target: ₹${goalTarget?.toLocaleString('en-IN')}, Current: ₹${goalCurrent?.toLocaleString('en-IN')}, Remaining: ₹${((goalTarget || 0) - (goalCurrent || 0)).toLocaleString('en-IN')}`;
      break;

    default:
      subject = 'FinAI Budget Notification';
      html = '<p>Budget notification from FinAI</p>';
      text = 'Budget notification from FinAI';
  }

  return {
    to: userEmail,
    subject,
    html,
    text
  };
}

export async function sendBudgetAlertEmail(alertData: BudgetAlertData): Promise<boolean> {
  try {
    const email = generateBudgetAlertEmail(alertData);
    
    // Log email details for development
    console.log('📧 Budget Alert Email:', {
      to: email.to,
      subject: email.subject,
      alertType: alertData.alertType,
      html: email.html.substring(0, 200) + '...' // Log first 200 chars
    });
    
    // Check if Gmail SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Gmail SMTP not configured, falling back to console logging');
      console.log('\n📧 EMAIL CONTENT:');
      console.log('To:', email.to);
      console.log('Subject:', email.subject);
      console.log('HTML Content:');
      console.log(email.html);
      console.log('\n📧 END EMAIL CONTENT\n');
      return true;
    }
    
    // Send via Gmail SMTP
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"FinAI" <${process.env.SMTP_USER}>`,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via Gmail SMTP:', info.messageId);
      return true;
      
    } catch (smtpError) {
      console.error('❌ Gmail SMTP error:', smtpError);
      
      // Fallback: Log email content for development
      console.log('\n📧 EMAIL CONTENT (SMTP Failed):');
      console.log('To:', email.to);
      console.log('Subject:', email.subject);
      console.log('HTML Content:');
      console.log(email.html);
      console.log('\n📧 END EMAIL CONTENT\n');
      
      return false;
    }
    
  } catch (error) {
    console.error('Error sending budget alert email:', error);
    return false;
  }
}
