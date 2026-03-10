# 🔧 Fix Google OAuth "Invalid Client" Error

## Problem
You're seeing: **"Error 401: invalid_client - The OAuth client was not found"**

This happens because the Google Client ID is not properly configured.

## ✅ Solution (Follow These Steps)

### Step 1: Get Your Google Client ID

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create or Select a Project**:
   - Click on the project dropdown at the top
   - Click "NEW PROJECT" or select existing project
   - Name it "Greenixx" or "Pavithra Traders"

3. **Enable Google+ API**:
   - Go to **APIs & Services > Library**
   - Search for "Google+ API"
   - Click and Enable it

4. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services > OAuth consent screen**
   - Choose **External** (for testing with any Google account)
   - Fill in:
     - App name: `Greenixx`
     - User support email: `your-email@gmail.com`
     - Developer contact: `your-email@gmail.com`
   - Click **Save and Continue**
   - Skip Scopes (click Save and Continue)
   - Add Test Users: Add your email (`kavineshv.23bsr@kongu.edu`)
   - Click **Save and Continue**

5. **Create OAuth Client ID**:
   - Go to **APIs & Services > Credentials**
   - Click **+ CREATE CREDENTIALS**
   - Select **OAuth client ID**
   - Choose **Web application**
   - Configure:
     - Name: `Greenixx Web Client`
     - **Authorized JavaScript origins**: Add these URLs:
       ```
       http://localhost:5173
       http://localhost:3000
       http://localhost:5174
       ```
     - **Authorized redirect URIs**: Add these:
       ```
       http://localhost:5173
       http://localhost:3000
       ```
   - Click **CREATE**

6. **Copy Your Client ID**:
   - You'll see a popup with your Client ID
   - It looks like: `123456789-abc123xyz.apps.googleusercontent.com`
   - **COPY THIS!** ✂️

### Step 2: Update Your Configuration Files

#### Frontend Configuration

1. Open `frontend/.env` file
2. Replace the placeholder with your real Client ID:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Example:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
```

#### Backend Configuration

1. Open `backend/server/.env` file
2. Add the same Client ID:

```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

### Step 3: Restart Everything

1. **Stop** all running servers (Ctrl+C)

2. **Restart Backend**:
   ```bash
   cd backend/server
   npm run dev
   ```

3. **Restart Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Clear Browser Cache**:
   - Press `Ctrl + Shift + Delete`
   - Clear cookies and cache
   - Or use Incognito/Private window

### Step 4: Test Google Login

1. Go to http://localhost:5173
2. Click **Login**
3. Click **Continue with Google** button
4. Sign in with your Google account
5. ✅ You should be logged in successfully!

## 🔍 Verification Checklist

Before testing, make sure:

- [ ] You have a valid Google Client ID (not the placeholder)
- [ ] The Client ID is the same in both `.env` files
- [ ] No extra spaces or quotes around the Client ID
- [ ] You added `http://localhost:5173` to authorized origins in Google Console
- [ ] You added your email as a test user in OAuth consent screen
- [ ] Both servers are restarted after changing `.env`
- [ ] Browser cache is cleared

## ❌ Common Mistakes to Avoid

1. **Using Android/iOS Client ID**: Make sure you created a **Web application** client ID
2. **Missing authorized origins**: Add `http://localhost:5173` to Google Console
3. **Not restarting servers**: Must restart after changing `.env` files
4. **Wrong .env file**: Frontend uses `VITE_` prefix, backend doesn't
5. **Extra quotes**: Don't add quotes around the Client ID

## 🆘 Still Not Working?

### Check Console Logs

Open browser DevTools (F12) and check for errors:
- Look for "Invalid client" or "Not found" errors
- Check Network tab for failed requests

### Verify Environment Variables

Add this temporarily to `frontend/src/main.jsx`:
```javascript
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

It should show your actual Client ID, not "your_google_client_id..."

### Test with Different Account

If still failing:
- Try logging in with a different Google account
- Make sure the account is added as a test user
- Check if the Google project is in "Testing" mode (not "Production")

## 📧 Need More Help?

If you're still stuck:
1. Share the exact error message from browser console
2. Verify your Client ID starts with numbers and ends with `.apps.googleusercontent.com`
3. Double-check authorized origins in Google Cloud Console match your URL

---

**Important**: Never commit your real Client ID to public repositories!
