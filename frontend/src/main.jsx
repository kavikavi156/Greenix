
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Warn if Google Client ID is not configured
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id.apps.googleusercontent.com') {
  console.warn('⚠️ Google OAuth is not configured!');
  console.warn('📋 Follow these steps to fix:');
  console.warn('1. Go to https://console.cloud.google.com/');
  console.warn('2. Create OAuth Client ID (Web application)');
  console.warn('3. Add it to frontend/.env as VITE_GOOGLE_CLIENT_ID');
  console.warn('4. Restart the dev server');
  console.warn('📖 See GOOGLE_OAUTH_FIX.md for detailed instructions');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
