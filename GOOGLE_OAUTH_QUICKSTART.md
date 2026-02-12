# Quick Start: Google OAuth Setup

This is a quick reference guide to get Google OAuth working. For detailed instructions, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md).

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Configure consent screen if prompted
6. Choose **Web application**
7. Add authorized origins:
   - `http://localhost:5173`
   - `https://yourdomain.com` (for production)
8. Copy the **Client ID**

### Step 2: Configure Backend

Create/edit `backend/server/.env`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### Step 3: Configure Frontend

Create/edit `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**Important:** Use the same Client ID in both files!

### Step 4: Restart Servers

```bash
# Terminal 1 - Backend
cd backend/server
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step 5: Test

1. Open http://localhost:5173
2. Go to customer login page
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be logged in! ✅

## 🔧 Troubleshooting

### Button doesn't appear?
- Check frontend `.env` has `VITE_GOOGLE_CLIENT_ID`
- Restart frontend server after adding env variable
- Check browser console for errors

### "Invalid Client ID" error?
- Verify Client ID is correct in both `.env` files
- No extra spaces or quotes in the ID
- Use Web Application Client ID (not Android/iOS)

### "Redirect URI mismatch"?
- Add `http://localhost:5173` to authorized origins in Google Console
- Make sure you're accessing from the same URL

## 📝 Environment Variables Checklist

**Backend** (`backend/server/.env`):
```
✓ GOOGLE_CLIENT_ID=...
✓ JWT_SECRET=...
✓ MONGODB_URI=...
```

**Frontend** (`frontend/.env`):
```
✓ VITE_GOOGLE_CLIENT_ID=...
```

## 🚀 Production Deployment

When deploying to production:

1. **Add production domain** to Google Console authorized origins
2. **Set environment variables** in your hosting platform:
   - Render/Heroku: Add `GOOGLE_CLIENT_ID`
   - Netlify/Vercel: Add `VITE_GOOGLE_CLIENT_ID`
3. **Test** on production URL before going live

## 📚 Need More Help?

- **Detailed Setup**: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- **Implementation Details**: [GOOGLE_OAUTH_IMPLEMENTATION.md](./GOOGLE_OAUTH_IMPLEMENTATION.md)
- **Google Docs**: https://developers.google.com/identity/protocols/oauth2

## ✨ What You Get

- ✅ One-click Google sign-in for customers
- ✅ Automatic account creation
- ✅ Secure OAuth 2.0 authentication
- ✅ No password required
- ✅ Google profile picture stored
- ✅ Email verification through Google

That's it! Your Google OAuth is ready to use. 🎉
