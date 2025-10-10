import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CustomerPage from './components/CustomerPage.jsx';
import EnhancedAdminPageNew from './components/EnhancedAdminPageNew.jsx';
import ProductShowcase from './components/ProductShowcase.jsx';
import LoginPage from './components/LoginPage.jsx';
import EnhancedHomePageNew from './components/EnhancedHomePageNew.jsx';
import Checkout from './components/Checkout.jsx';
import ProfessionalToast from './components/ProfessionalToast.jsx';
import { useState } from 'react';

function AdminLogin() {
  return <EnhancedAdminPageNew />;
}

function CheckoutWrapper() {
  const location = useLocation();
  const { cartItems, totalAmount, token, isBuyNow } = location.state || {};
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'info' });
  
  if (!cartItems || !token) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <ProfessionalToast visible={toast.visible} title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, visible: false })} />
      <Checkout 
        token={token}
        cartItems={cartItems}
        totalAmount={totalAmount}
        onClose={() => window.history.back()}
        onOrderComplete={() => {
          setToast({ visible: true, title: 'Order Successful', message: 'Order completed successfully!', type: 'success' });
          // Navigate back to home page after a short delay so user sees toast
          setTimeout(() => { window.location.href = '/'; }, 900);
        }}
      />
    </>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<EnhancedHomePageNew />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout" element={<CheckoutWrapper />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/customer" element={<Navigate to="/" replace />} />
        <Route path="/showcase" element={<ProductShowcase />} />
        <Route path="*" element={<EnhancedHomePageNew />} />
      </Routes>
    </>
  );
}

export default App;
