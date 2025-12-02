# Razorpay Payment Gateway Setup Instructions

## Current Issue
Your Razorpay payment is failing because you need to add **valid Razorpay API credentials**.

## Step-by-Step Setup

### 1. Get Razorpay Account & Keys

1. **Sign up at Razorpay:**
   - Visit: https://dashboard.razorpay.com/signup
   - Fill in your details:
     - Business Name: Greenix / Pavithra Traders
     - Email & Phone
     - Password
   
2. **Verify Your Account:**
   - Verify email
   - Add KYC details (required for live mode, optional for test mode)

3. **Get API Keys:**
   - Login to Razorpay Dashboard
   - Go to **Settings** → **API Keys**
   - Click **Generate Test Keys** (for testing)
   - You'll see:
     - **Key ID**: Starts with `rzp_test_...`
     - **Key Secret**: Long alphanumeric string (click "reveal" to see)
   
4. **Copy both keys** - you'll need them in the next step

### 2. Update Environment Variables

Open this file: `backend/server/.env`

Replace these lines:
```env
RAZORPAY_KEY_ID=rzp_test_YourActualKeyId
RAZORPAY_KEY_SECRET=YourActualKeySecret
```

With your actual keys:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_FROM_DASHBOARD
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET_FROM_DASHBOARD
```

**Important:** Keep these keys SECRET! Never commit them to GitHub.

### 3. Restart Backend Server

After updating `.env`, restart your server:

**In PowerShell/Terminal:**
```powershell
# Stop the current server (Ctrl+C)
# Then restart:
cd D:\Greenixx\Greenix\backend\server
node index.js
```

### 4. Test the Integration

1. Open your frontend: http://localhost:5173
2. Add items to cart
3. Go to checkout
4. Select "Razorpay" as payment method
5. Click "Pay Now"

### 5. Use Test Payment Details

When the Razorpay checkout opens, use these **TEST credentials**:

**Test Card Numbers:**
- **Successful Payment:** 4111 1111 1111 1111
- **CVV:** Any 3 digits (e.g., 123)
- **Expiry:** Any future date (e.g., 12/25)
- **Name:** Any name

**Test UPI ID:**
- **UPI ID:** success@razorpay

**Test Wallets:**
- Select any wallet → Enter OTP: 1234

### 6. Verify Payment Works

After successful payment, you should see:
- ✅ Payment success message
- Order confirmation
- Payment details in your order

### 7. For Production (When Going Live)

1. Complete KYC in Razorpay Dashboard
2. Get **Live API Keys** (start with `rzp_live_...`)
3. Update environment variables on your hosting platform:
   - On Render: Settings → Environment → Add variables
   - On Netlify: Site Settings → Environment Variables

4. Update these keys:
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
```

## Troubleshooting

### Error: "Failed to create payment order"
**Cause:** Invalid or missing API keys
**Fix:** 
1. Check if keys are correctly copied in `.env`
2. Restart the backend server
3. No extra spaces in the keys

### Error: "Payment verification failed"
**Cause:** Mismatched signatures
**Fix:** Ensure both Key ID and Secret are correct

### Payment modal doesn't open
**Cause:** Razorpay script not loaded
**Fix:** Check browser console for errors, ensure internet connection

### CORS Error
**Fix:** Already configured in your backend

## Security Checklist

- [ ] Added `.env` to `.gitignore`
- [ ] Never committed API keys to GitHub
- [ ] Using test keys for development
- [ ] Will switch to live keys only in production

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/
- Test Cases: https://razorpay.com/docs/payments/payments/test-card-details/

---

**Next Steps:**
1. Get your Razorpay keys from the dashboard
2. Update the `.env` file
3. Restart the server
4. Test with the provided test card details
