import nodemailer from 'nodemailer';

// Create transporter
// For demo/testing: Using Ethereal (fake SMTP service)
// For production: Replace with real SMTP credentials (Gmail, SendGrid, etc.)
let transporter = null;

const createTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    // Use real SMTP if configured
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // For demo: Create test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },      tls: {
        rejectUnauthorized: false
      }    });
    console.log('📧 Using Ethereal test email account');
  }
  return transporter;
};

// Welcome email template
const getWelcomeEmailHTML = (userName) => {
  const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to NomadLand</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .logo {
          font-size: 42px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          color: #333;
          line-height: 1.6;
        }
        .greeting {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #667eea;
        }
        .message {
          font-size: 16px;
          margin-bottom: 30px;
        }
        .features {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .features h3 {
          margin-top: 0;
          color: #667eea;
          font-size: 18px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          padding: 8px 0;
          display: flex;
          align-items: center;
        }
        .feature-list li:before {
          content: "✓";
          color: #667eea;
          font-weight: bold;
          margin-left: 10px;
          font-size: 18px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f9f9f9;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          font-size: 24px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🌍</div>
          <h1>NomadLand</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">מפת הנוודים הדיגיטליים</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            שלום ${userName}! 👋
          </div>
          
          <div class="message">
            <p><strong>ברוכים הבאים לקהילת NomadLand!</strong></p>
            <p>אנחנו שמחים שהצטרפת אלינו. כעת יש לך גישה למפה הדיגיטלית המקיפה ביותר לנוודים דיגיטליים ברחבי העולם.</p>
          </div>
          
          <div class="features">
            <h3>מה אפשר לעשות באתר?</h3>
            <ul class="feature-list">
              <li>גלה מקומות מומלצים ואזורי נוודים פופולריים</li>
              <li>הוסף נקודות משלך ושתף את החוויה שלך</li>
              <li>צור והשתתף באירועי קהילה מקומיים</li>
              <li>קרא ביקורות מנוודים אחרים</li>
              <li>שמור מקומות מועדפים במפות אישיות</li>
              <li>התחבר לקהילה הגלובלית של נוודים</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${appUrl}" class="cta-button">התחל לחקור עכשיו</a>
          </div>
          
          <div class="message" style="margin-top: 30px;">
            <p>💡 <strong>טיפ:</strong> התחל בחקירת האזורים הפופולריים ביותר כמו קו פנגאן, גואה, בנסקו ועוד...</p>
          </div>
        </div>
        
        <div class="footer">
          <p>שאלות? צריכים עזרה? נשמח לסייע!</p>
          <p>
            <a href="${appUrl}">בקר באתר</a> | 
            <a href="${appUrl}/about">אודות</a>
          </p>
          <p style="margin-top: 20px; color: #999; font-size: 12px;">
            קיבלת מייל זה כי נרשמת לאתר NomadLand<br>
            © 2025 NomadLand. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send welcome email
const sendWelcomeEmail = async (to, userName) => {
  try {
    if (!transporter) {
      await createTransporter();
    }

    const mailOptions = {
      from: '"NomadLand 🌍" <welcome@nomadland.com>',
      to: to,
      subject: 'ברוכים הבאים ל-NomadLand! 🎉',
      html: getWelcomeEmailHTML(userName),
      text: `שלום ${userName}!\n\nברוכים הבאים ל-NomadLand!\n\nאנחנו שמחים שהצטרפת אלינו. כעת יש לך גישה למפה הדיגיטלית המקיפה ביותר לנוודים דיגיטליים ברחבי העולם.\n\nהתחל לחקור: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n\nבהצלחה,\nצוות NomadLand`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
    // For Ethereal, show preview URL
    if (info.messageId && !process.env.EMAIL_HOST) {
      console.log('🔗 Preview email:', nodemailer.getTestMessageUrl(info));
      console.log('👆 Click the link above to see the email in your browser');
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Password reset email template
const getPasswordResetEmailHTML = (userName, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          color: #333;
          line-height: 1.6;
        }
        .greeting {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #667eea;
        }
        .message {
          font-size: 16px;
          margin-bottom: 30px;
        }
        .warning-box {
          background-color: #fff3cd;
          border-right: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .cta-button {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 30px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🔐 איפוס סיסמה</h1>
        </div>
        
        <div class="content">
          <div class="greeting">שלום ${userName},</div>
          
          <p class="message">
            קיבלנו בקשה לאיפוס הסיסמה שלך ב-NomadLand.
          </p>

          <div class="warning-box">
            <strong>⚠️ חשוב לדעת:</strong>
            <ul style="margin: 10px 0; padding-right: 20px;">
              <li>הקישור תקף לשעה אחת בלבד</li>
              <li>אם לא ביקשת לאפס את הסיסמה, התעלם ממייל זה</li>
              <li>אל תשתף את הקישור עם אף אחד</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="cta-button">
              אפס את הסיסמה שלי
            </a>
          </div>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            אם הכפתור למעלה לא עובד, העתק והדבק את הקישור הבא בדפדפן שלך:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>
            צריך עזרה? צור קשר: <a href="mailto:nomadland@nml.com">nomadland@nml.com</a>
          </p>
          <p style="margin-top: 20px; color: #999; font-size: 12px;">
            © 2025 NomadLand. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send password reset email
const sendPasswordResetEmail = async (to, userName, resetUrl) => {
  try {
    if (!transporter) {
      await createTransporter();
    }

    const mailOptions = {
      from: '"NomadLand 🔐" <security@nomadland.com>',
      to: to,
      subject: 'איפוס סיסמה - NomadLand',
      html: getPasswordResetEmailHTML(userName, resetUrl),
      text: `שלום ${userName},\n\nקיבלנו בקשה לאיפוס הסיסמה שלך ב-NomadLand.\n\nלחץ על הקישור הבא לאיפוס הסיסמה (תקף לשעה אחת):\n${resetUrl}\n\nאם לא ביקשת לאפס את הסיסמה, התעלם ממייל זה.\n\nבברכה,\nצוות NomadLand`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
    // For Ethereal, show preview URL
    if (info.messageId && !process.env.EMAIL_HOST) {
      console.log('🔗 Preview email:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

export { sendWelcomeEmail, sendPasswordResetEmail };
