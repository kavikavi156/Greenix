import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import DealerDashboard from './DealerDashboard.jsx';
import LoginForm from './LoginForm.jsx';
import '../css/EnhancedAdmin.css'; // Reuse Admin styles

export default function DealerLoginPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    function checkAuthStatus() {
        const dealerToken = localStorage.getItem('dealerToken');
        if (dealerToken) {
            try {
                const decodedToken = jwtDecode(dealerToken);
                if (decodedToken.role === 'dealer' && decodedToken.exp > Date.now() / 1000) {
                    setIsLoggedIn(true);
                    setToken(dealerToken);
                } else {
                    localStorage.removeItem('dealerToken');
                }
            } catch (error) {
                localStorage.removeItem('dealerToken');
            }
        }
        setLoading(false);
    }

    function handleLogin(dealerToken) {
        localStorage.setItem('dealerToken', dealerToken);
        setToken(dealerToken);
        setIsLoggedIn(true);
    }

    function handleLogout() {
        localStorage.removeItem('dealerToken');
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
                {/* Reuse Admin Background */}
                <div className="admin-background">
                    <div className="floating-shapes">
                        {/* ... reuse shapes or maybe change color via CSS if needed ... */}
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                </div>

                {/* Header */}
                <header className="admin-login-header">
                    <div className="admin-login-nav">
                        <div className="admin-logo">
                            <span className="logo-icon">🚚</span>
                            <span className="logo-text">Greenixx</span>
                            <span className="logo-admin">Dealer Portal</span>
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

                            {/* Left Side: Info */}
                            <div className="admin-info-section" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                                <div className="admin-info-content">
                                    <h1 className="admin-info-title">
                                        Partner with us for<br />
                                        <span style={{ color: '#d1fae5' }}>Efficient Delivery</span>
                                    </h1>
                                    <p className="admin-info-description">
                                        Manage your assigned orders, update delivery status, and track your performance.
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Login Form */}
                            <div className="admin-form-section">
                                <div className="admin-form-card">
                                    <div className="admin-form-header">
                                        <h2 className="admin-form-title">Dealer Login</h2>
                                        <p className="admin-form-subtitle">Access your order management dashboard</p>
                                    </div>

                                    <LoginForm role="dealer" onLogin={handleLogin} />

                                    <div className="admin-security-notice" style={{ marginTop: '2rem' }}>
                                        <span className="security-icon">🔒</span>
                                        <p>Authorized Dealers Only.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <DealerDashboard token={token} onLogout={handleLogout} />;
}
