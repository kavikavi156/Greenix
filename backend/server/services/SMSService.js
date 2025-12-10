// Email/OTP Service
const nodemailer = require('nodemailer');

class EmailService {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create email transporter
   */
  static createTransporter() {
    // Using Gmail as example - you can use any SMTP service
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }

  /**
   * Send OTP via Email
   * @param {string} email - Email address to send OTP
   * @param {string} otp - OTP code to send
   * @param {string} userName - User's name for personalization
   */
  static async sendOTP(email, otp, userName = 'User') {
    try {
      const transporter = this.createTransporter();

      const mailOptions = {
        from: `"Pavithra Traders" <${process.env.EMAIL_USER || 'noreply@pavithratraders.com'}>`,
        to: email,
        subject: '🔐 Password Reset OTP - Pavithra Traders',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌾 Pavithra Traders</h1>
                <p>Password Reset Request</p>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>You requested to reset your password. Use the OTP below to complete the process:</p>
                
                <div class="otp-box">
                  <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 5 minutes</p>
                </div>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Never share this OTP with anyone</li>
                    <li>Pavithra Traders will never ask for your OTP</li>
                    <li>This OTP expires in 5 minutes</li>
                    <li>If you didn't request this, please ignore this email</li>
                  </ul>
                </div>

                <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Pavithra Traders. All rights reserved.</p>
                  <p>Agricultural Products & Services</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      // For development: Log to console
      console.log('='.repeat(50));
      console.log('📧 EMAIL OTP SERVICE');
      console.log('='.repeat(50));
      console.log(`📬 To: ${email}`);
      console.log(`👤 Name: ${userName}`);
      console.log(`🔐 OTP: ${otp}`);
      console.log(`⏰ Valid for: 5 minutes`);
      console.log('='.repeat(50));

      // Send email if credentials are configured
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return {
          success: true,
          message: 'OTP sent successfully to your email'
        };
      } else {
        console.log('⚠️  Email credentials not configured. Using console for testing.');
        console.log('💡 Add EMAIL_USER and EMAIL_PASSWORD to .env file to send real emails');
        return {
          success: true,
          message: 'OTP sent successfully (development mode)'
        };
      }
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  /**
   * Send password reset confirmation email
   */
  static async sendPasswordResetConfirmation(email, userName = 'User') {
    try {
      const transporter = this.createTransporter();

      const mailOptions = {
        from: `"Pavithra Traders" <${process.env.EMAIL_USER || 'noreply@pavithratraders.com'}>`,
        to: email,
        subject: '✅ Password Changed Successfully - Pavithra Traders',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌾 Pavithra Traders</h1>
                <p>Password Changed</p>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                
                <div class="success-box">
                  <strong>✅ Success!</strong>
                  <p style="margin: 10px 0 0 0;">Your password has been changed successfully.</p>
                </div>

                <p>You can now login with your new password.</p>
                <p>If you didn't make this change, please contact our support team immediately.</p>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Pavithra Traders. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      console.log('='.repeat(50));
      console.log('✅ Password Reset Confirmation Email');
      console.log('='.repeat(50));
      console.log(`📬 To: ${email}`);
      console.log(`👤 Name: ${userName}`);
      console.log('='.repeat(50));

      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent:', info.messageId);
        return { success: true, message: 'Confirmation sent' };
      } else {
        console.log('⚠️  Email credentials not configured. Skipping email send.');
        return { success: true, message: 'Confirmation logged' };
      }
    } catch (error) {
      console.error('❌ Error sending confirmation:', error);
      return { success: false, message: 'Failed to send confirmation' };
    }
  }
}

module.exports = EmailService;
