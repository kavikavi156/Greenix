# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for customer login in your application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Pavithra Traders")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the app name: "Pavithra Traders"
   - Add your email as the support email
   - Add authorized domains (your domain name)
   - Click "Save and Continue"
   - Skip scopes (or add email and profile scopes)
   - Add test users if needed
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "Pavithra Traders Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for local development)
     - `https://yourdomain.com` (for production)
   - Click "Create"

5. Copy the Client ID that appears

## Step 4: Configure Environment Variables

### Backend (.env file in backend/server/)

Add the following environment variable to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### Frontend (.env file in frontend/)

Create a `.env` file in the `frontend` directory and add:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

**Note:** Use the same Client ID for both backend and frontend.

## Step 5: Restart Your Application

After adding the environment variables, restart both the backend and frontend servers:

### Backend
```bash
cd backend/server
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

## Testing Google OAuth

1. Navigate to the customer login page
2. You should see a "Continue with Google" button
3. Click the button
4. Select your Google account
5. Grant permissions if prompted
6. You should be automatically logged in

## Security Considerations

1. **Never commit your `.env` files** - They contain sensitive credentials
2. Add `.env` to your `.gitignore` file
3. For production, set environment variables in your hosting platform (Render, Netlify, etc.)
4. Only add trusted domains to authorized origins
5. Regularly review and rotate credentials if needed

## Troubleshooting

### "Invalid Client ID" Error
- Verify the Client ID is correctly copied in both frontend and backend `.env` files
- Make sure there are no extra spaces or quotes
- Ensure you're using the Web Application Client ID (not Android/iOS)

### "Redirect URI Mismatch" Error
- Check that your current URL is listed in the Authorized JavaScript origins
- For local development, ensure `http://localhost:5173` is added
- For production, add your production domain

### Google Button Not Showing
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Ensure the frontend server was restarted after adding the env variable

### "Access Blocked" Error
- Complete the OAuth consent screen configuration
- Add your test users in Google Cloud Console
- For production, submit your app for verification if needed

## Additional Features

The Google OAuth integration provides:

- **Automatic User Creation**: New users signing in with Google are automatically created
- **Email Verification**: Google accounts are pre-verified
- **Profile Picture**: User's Google profile picture is stored
- **Secure Authentication**: Uses Google's OAuth 2.0 protocol
- **Seamless Experience**: One-click login for returning users

## For Production Deployment

When deploying to production (Render, Netlify, etc.):

1. Add your production domain to Google Cloud Console:
   - Authorized JavaScript origins
   - Authorized redirect URIs

2. Set environment variables in your hosting platform:
   - **Backend (Render)**: Add `GOOGLE_CLIENT_ID` in environment variables
   - **Frontend (Netlify)**: Add `VITE_GOOGLE_CLIENT_ID` in build environment variables

3. If you get "This app isn't verified" warning:
   - Add all team members as test users
   - Or submit your app for Google verification (for public apps)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure your Google Cloud project is properly configured
4. Check that the Google+ API is enabled

For more information, visit [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
