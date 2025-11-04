import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL || process.env.SMTP_USER,
        pass: process.env.PASSWORD || process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// SMTP connection test disabled
// transporter.verify((error, success) => {
//     if (error) {
//         console.error('SMTP connection error:', error.message);
//     } else {
//         console.log('SMTP server ready');
//     }
// });

export default transporter;