// SMS functionality removed - using email-only notifications

// Email service using Brevo HTTP API
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Brevo API key not configured');
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: process.env.FROM_NAME || 'BuildEstate',
          email: process.env.FROM_EMAIL || 'noreply@buildestate.com'
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent || subject
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};



// Email verification disabled
// const sendVerificationEmail = async (userEmail, userName, verificationCode) => {
//   const subject = 'Verify Your BuildEstate Account';
//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//       <h2 style="color: #2563eb;">Verify Your Account</h2>
//       <p>Hello ${userName},</p>
//       <p>Thank you for signing up with BuildEstate! Please verify your email address using the code below:</p>
//       <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
//         <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${verificationCode}</h1>
//       </div>
//       <p>This code will expire in 10 minutes.</p>
//       <p>If you didn't create an account, please ignore this email.</p>
//       <p>Best regards,<br>The BuildEstate Team</p>
//     </div>
//   `;
//   
//   return await sendEmail(userEmail, subject, htmlContent);
// };





export {
  sendEmail
};