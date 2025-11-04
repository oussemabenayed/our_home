# Free Email Notification Service Setup Guide

This guide will help you set up completely free email notifications for your BuildEstate application.

## 🔧 Brevo (Email Service) - FREE Setup

### Step 1: Create Brevo Account
1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click "Sign up free"
3. Enter your details and verify email
4. **Free Plan**: 300 emails/day forever

### Step 2: Get API Key
1. Login to Brevo dashboard
2. Go to "Settings" → "API Keys"
3. Click "Generate a new API key"
4. Copy the API key

### Step 3: Update .env file
```env
BREVO_API_KEY=your_brevo_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=BuildEstate
```



## 🇹🇳 Tunisia-Specific Notes

### Email Delivery
- Brevo has excellent delivery rates in Tunisia
- French company with MENA optimization
- Better than Gmail for business emails

## 🚀 Testing Your Setup

### Test Email Service
```bash
cd backend
node --input-type=module -e "
import { sendWelcomeEmail } from './services/notificationService.js';
sendWelcomeEmail('test@example.com', 'Test User')
  .then(result => console.log('Email test:', result))
  .catch(err => console.error('Email error:', err));
"
```



## 💡 Cost Breakdown

### Brevo (Email)
- **Free**: 300 emails/day
- **Paid**: €25/month for 20,000 emails
- **Perfect for**: Small to medium real estate websites



## 🔒 Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all credentials
3. **Rotate keys regularly** for production
4. **Monitor usage** to avoid unexpected charges

## 🆘 Troubleshooting

### Email Issues
- Check spam folder
- Verify sender domain
- Check Brevo dashboard for delivery status



## 📞 Support

- **Brevo Support**: [https://help.brevo.com](https://help.brevo.com)


---

**Note**: Brevo offers a generous free tier (300 emails/day) perfect for development and small-scale production use in Tunisia.