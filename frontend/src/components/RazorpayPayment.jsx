import { useState, useEffect } from 'react';
import '../css/RazorpayPayment.css';

const RazorpayPayment = ({ orderData, onPaymentSuccess, onPaymentFailure, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amount) => {
    try {
      const response = await fetch('http://localhost:3001/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch('http://localhost:3001/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        return;
      }

      // Create order
      const orderResult = await createRazorpayOrder(orderData.totalAmount);
      if (!orderResult.success) {
        setError('Failed to create payment order. Please try again.');
        return;
      }

      // Configure Razorpay options
      const options = {
        key: orderResult.key,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: 'Pavithra Traders',
        description: 'Payment for your order',
        order_id: orderResult.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderData,
            });

            if (verificationResult.success) {
              onPaymentSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            } else {
              onPaymentFailure('Payment verification failed');
            }
          } catch (error) {
            onPaymentFailure('Payment verification failed');
          }
        },
        prefill: {
          name: 'Pavithra Traders',
          email: orderData.userEmail || '',
          contact: '7904212501',
        },
        theme: {
          color: '#2E7D32',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-initiate payment when component mounts
    if (orderData && orderData.totalAmount) {
      handlePayment();
    }
  }, []);

  return (
    <div className="razorpay-payment-container">
      <div className="payment-header">
        <h3>Complete Your Payment</h3>
        <p>Amount to pay: ₹{orderData.totalAmount}</p>
      </div>

      {loading && (
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Processing payment...</p>
        </div>
      )}

      {error && (
        <div className="payment-error">
          <p>{error}</p>
          <button onClick={handlePayment} className="retry-btn">
            Retry Payment
          </button>
        </div>
      )}

      <div className="payment-info">
        <div className="security-info">
          <h4>🔒 Secure Payment</h4>
          <p>Your payment is secured by Razorpay with 256-bit SSL encryption</p>
        </div>
        
        <div className="payment-methods">
          <h4>Accepted Payment Methods:</h4>
          <div className="method-icons">
            <span>💳 Cards</span>
            <span>🏦 Net Banking</span>
            <span>📱 UPI</span>
            <span>📱 Wallets</span>
          </div>
        </div>
      </div>

      <div className="payment-actions">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        {!loading && (
          <button onClick={handlePayment} className="pay-now-btn">
            Pay Now ₹{orderData.totalAmount}
          </button>
        )}
      </div>
    </div>
  );
};

export default RazorpayPayment;
