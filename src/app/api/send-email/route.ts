import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, type, alertType } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('\n📧 EMAIL SENDING REQUEST:');
    console.log('Type:', type || 'general');
    console.log('Alert Type:', alertType || 'N/A');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML Length:', html.length);
    console.log('Text Length:', text?.length || 0);
    console.log('📧 END EMAIL REQUEST\n');

    // Check if Gmail SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Gmail SMTP not configured, email will be logged only');
      return NextResponse.json({ 
        success: true, 
        message: 'Email logged successfully (Gmail SMTP not configured)',
        emailType: type || 'general',
        alertType: alertType || 'N/A'
      });
    }

    // Send via Gmail SMTP
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"FinAI" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via Gmail SMTP:', info.messageId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully via Gmail SMTP',
        messageId: info.messageId,
        emailType: type || 'general',
        alertType: alertType || 'N/A'
      });
      
    } catch (smtpError) {
      console.error('❌ Gmail SMTP error:', smtpError);
      return NextResponse.json({ 
        error: 'Failed to send email via Gmail SMTP',
        details: smtpError instanceof Error ? smtpError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
