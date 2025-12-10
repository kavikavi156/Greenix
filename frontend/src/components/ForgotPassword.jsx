import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter Username/Email, 2: Enter OTP, 3: Reset Password
  const [identifier, setIdentifier] = useState(''); // username or email
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate identifier
    if (!identifier.trim()) {
      setError('Please enter your username or email');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMaskedEmail(data.maskedEmail);
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setResetToken(data.resetToken);
        setStep(3);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>🔒 Reset Password</h2>
          <p>Step {step} of 3</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Enter Username or Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="forgot-password-form">
            <div className="step-info">
              <p>Enter your username or email to receive OTP on your registered email address</p>
            </div>
            
            <div className="form-group">
              <label>Username or Email</label>
              <input
                type="text"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <button 
              type="button" 
              className="back-btn" 
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="forgot-password-form">
            <div className="step-info">
              <p>OTP has been sent to {maskedEmail}</p>
              <small>Please check your email inbox for the OTP</small>
            </div>
            
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button 
              type="button" 
              className="back-btn" 
              onClick={() => setStep(1)}
            >
              Use Different Account
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="step-info">
              <p>Create a new password for your account</p>
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="6"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="6"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="forgot-password-footer">
          <p className="security-note">
            🔐 Your password will be encrypted and stored securely
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                <circle className="success-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h3>Password Reset Successful!</h3>
            <p>You can now login with your new password</p>
            <div className="success-loader"></div>
          </div>
        </div>
      )}
    </div>
  );
}
