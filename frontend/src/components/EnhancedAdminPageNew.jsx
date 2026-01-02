import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ProfessionalAdminDashboard from './ProfessionalAdminDashboard.jsx';
import LoginForm from './LoginForm.jsx';
import '../css/EnhancedAdmin.css';

export default function EnhancedAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  function checkAuthStatus() {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      try {
        const decodedToken = jwtDecode(adminToken);
        if (decodedToken.role === 'admin' && decodedToken.exp > Date.now() / 1000) {
          setIsLoggedIn(true);
          setToken(adminToken);
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        localStorage.removeItem('adminToken');
      }
    }
    setLoading(false);
  }

  function handleLogin(adminToken) {
    localStorage.setItem('adminToken', adminToken);
    setToken(adminToken);
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setToken(null);
    navigate('/');
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="enhanced-admin-login">
        {/* Animated Background */}
        <div className="admin-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
        </div>

        {/* Header */}
        <header className="admin-login-header">
          <div className="admin-login-nav">
            <div className="admin-logo">
              <span className="logo-icon">🌾</span>
              <span className="logo-text">Greenixx</span>
              <span className="logo-admin">Admin Portal</span>
            </div>
            <button onClick={() => navigate('/')} className="back-btn">
              Back to Home
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="admin-login-main">
          <div className="admin-login-container">
            <div className="admin-login-content">

              {/* Left Side: Info & Features */}
              <div className="admin-info-section">
                <div className="admin-info-content">
                  <h1 className="admin-info-title">
                    Manage Your Agriculture<br />
                    Business <span style={{ color: '#64b5f6' }}>Efficiently</span>
                  </h1>
                  <p className="admin-info-description">
                    Complete control over pricing, inventory, orders, and customer relationships in one unified dashboard.
                  </p>

                  <div className="admin-features-list">
                    <div className="admin-feature-item">
                      <span className="feature-icon">📊</span>
                      <div>
                        <h4>Real-time Analytics</h4>
                        <p>Track sales, revenue, and product performance instantly</p>
                      </div>
                    </div>
                    <div className="admin-feature-item">
                      <span className="feature-icon">📦</span>
                      <div>
                        <h4>Inventory Management</h4>
                        <p>Seamlessly manage stock levels and product details</p>
                      </div>
                    </div>
                    <div className="admin-feature-item">
                      <span className="feature-icon">👥</span>
                      <div>
                        <h4>Customer Insights</h4>
                        <p>View customer data and order history</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Login Form */}
              <div className="admin-form-section">
                <div className="admin-form-card">
                  <div className="admin-form-header">
                    <h2 className="admin-form-title">Welcome Back</h2>
                    <p className="admin-form-subtitle">Secure access for administrators</p>
                  </div>

                  <LoginForm role="admin" onLogin={handleLogin} />

                  <div className="admin-security-notice" style={{ marginTop: '2rem' }}>
                    <span className="security-icon">🔒</span>
                    <p>Secure 256-bit encrypted connection. Unauthorized access is prohibited.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProfessionalAdminDashboard token={token} onLogout={handleLogout} />;
}
