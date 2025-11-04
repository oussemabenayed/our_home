import transporter from './config/nodemailer.js';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL:', process.env.EMAIL);
    console.log('PASSWORD:', process.env.PASSWORD ? '***configured***' : 'NOT SET');
    
    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL, // Send to self for testing
      subject: 'BuildEstate Email Test',
      html: '<h1>Email service is working!</h1><p>This is a test email from BuildEstate.</p>'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
};

testEmail();