import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginForm({ role, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username, role });

      let endpoint = '/api/auth/login';
      let payload = { username, password };

      if (role === 'admin') {
        endpoint = '/api/admin-auth/login';
        payload = { email: username, password }; // Admin uses email
      } else if (role === 'dealer') {
        endpoint = '/api/dealer-auth/login';
        payload = { email: username, password }; // Dealer uses email
      }

      const res = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Login response status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Login response data:', data);

      if (data.role === role) {
        onLogin(data.token);
      } else {
        setError(`Invalid role. Expected: ${role}, Got: ${data.role}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting Google login');

      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Google login response:', data);

      if (data.role === role) {
        onLogin(data.token);
      } else {
        setError(`Invalid role. Google sign-in is only for customers.`);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(`Google sign-in failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleError() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'your_google_client_id.apps.googleusercontent.com') {
      setError('Google OAuth is not configured. Please contact the administrator or check GOOGLE_OAUTH_FIX.md for setup instructions.');
      console.error('Google Client ID is not configured in .env file');
    } else {
      setError('Google sign-in failed. Please try again or use email/password login.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="enhanced-login-form">
      <h2 className="form-title-hidden">{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>

      <div className="input-group">
        <input
          type="text"
          placeholder={`${(role === 'admin' || role === 'dealer') ? 'Email Address' : 'Username'}`}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          disabled={isLoading}
          className="enhanced-input"
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="enhanced-input"
        />
      </div>

      <div className="forgot-password-link">
        <Link to="/forgot-password" className="link-text">
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="enhanced-submit-btn"
      >
        {isLoading ? (
          <span className="loading-content">
            <span className="spinner"></span>
            Signing in...
          </span>
        ) : (
          `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`
        )}
      </button>

      {role === 'customer' && (
        <>
          <div className="divider">
            <span>OR</span>
          </div>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              width="100%"
            />
          </div>
        </>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </form>
  );
}
