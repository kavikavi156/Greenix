import { useEffect } from 'react';

export default function Bill({
  user,
  cartItems,
  totalAmount,
  orderData,
  onOrderComplete,
  token,
  isBuyNow // flag forwarded from Checkout to indicate temporary buy-now flow
}) {
  console.log('Bill component rendered with props:', { user, cartItems, totalAmount, orderData });

  const currentDate = new Date();
  const orderDate = currentDate.toLocaleDateString('en-IN');
  const orderTime = currentDate.toLocaleTimeString('en-IN');

  useEffect(() => {
    console.log('Bill component mounted');

    // Clear the saved DB cart here only for regular checkouts (not buy-now)
    // The backend still owns cart mutation, but clearing via the dedicated endpoint
    // is a simple UX step so the cart shows empty when the user returns to the cart UI.
    if (!isBuyNow) {
      clearCartAfterOrder();
    } else {
      console.log('Buy-now order detected; skipping saved cart clear');
    }
  }, []);

  const clearCartAfterOrder = async () => {
    try {
      if (token && user && user.userId) {
        // Clear cart on server
        const response = await fetch(`http://localhost:3001/api/customer/cart/${user.userId}/clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Failed to clear cart on server (Bill):', response.status);
        } else {
          console.log('Cart cleared successfully on server (Bill)');
        }
      } else {
        console.log('Skipping cart clear: missing token or user ID');
      }
    } catch (error) {
      console.error('Error clearing cart from Bill component:', error);
    }
  };

  // Add validation for required props
  if (!user || !cartItems || !orderData) {
    return (
      <div className="bill-container">
        <div className="error-message">
          <h3>⚠️ Bill Generation Error</h3>
          <p>Missing required information to generate the bill.</p>
          <p>Please contact support if this issue persists.</p>
        </div>
      </div>
    );
  }

  function printBill() {
    window.print();
  }

  function downloadBill() {
    // Create a professional printable version
    const printContent = document.getElementById('bill-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${orderData.orderId} | Pavithra Traders</title>
          <style>
            /* Professional Print Styles */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: white;
              margin: 0;
              padding: 20px;
            }
            
            .bill-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white;
              border: 2px solid #1e40af;
              border-radius: 0;
            }
            
            .bill-header { 
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white; 
              padding: 30px 40px;
              text-align: left;
              position: relative;
            }
            
            .bill-header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .company-info h2 { 
              font-size: 28px; 
              font-weight: 800; 
              margin-bottom: 8px;
            }
            
            .company-tagline {
              font-size: 14px;
              opacity: 0.9;
              margin-bottom: 10px;
            }
            
            .company-contact {
              font-size: 12px;
              opacity: 0.8;
            }
            
            .invoice-badge {
              text-align: right;
              background: rgba(255,255,255,0.15);
              padding: 15px 20px;
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.2);
            }
            
            .invoice-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            
            .invoice-date {
              font-size: 12px;
            }
            
            .bill-content-area { 
              padding: 40px; 
            }
            
            .bill-details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            
            .bill-section h3 { 
              color: #1f2937;
              font-size: 16px; 
              font-weight: 700; 
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 2px solid #e5e7eb;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .detail-box {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            
            .detail-item {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-item:last-child {
              border-bottom: none;
            }
            
            .detail-label {
              font-weight: 600;
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
            }
            
            .detail-value {
              font-weight: 700;
              color: #1f2937;
              font-size: 14px;
            }
            
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              border: 1px solid #d1d5db;
            }
            
            .invoice-table thead {
              background: #1f2937;
            }
            
            .invoice-table th { 
              color: white;
              font-weight: 700;
              padding: 12px 15px;
              text-align: left;
              font-size: 12px;
              text-transform: uppercase;
            }
            
            .invoice-table td { 
              padding: 12px 15px;
              border-bottom: 1px solid #f3f4f6;
              color: #374151;
              font-size: 13px;
            }
            
            .item-name {
              font-weight: 600;
              color: #1f2937;
            }
            
            .item-category {
              background: #dbeafe;
              color: #1d4ed8;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
            }
            
            .item-total {
              font-weight: 700;
              color: #1f2937;
            }
            
            .bill-total-section {
              background: #f8fafc;
              padding: 25px;
              border-radius: 8px;
              border: 1px solid #d1d5db;
              margin: 25px 0;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #d1d5db;
            }
            
            .total-row:last-child {
              border-bottom: none;
              margin-top: 10px;
              padding-top: 15px;
              border-top: 2px solid #374151;
            }
            
            .total-label {
              font-weight: 600;
              color: #6b7280;
            }
            
            .total-value {
              font-weight: 700;
              color: #1f2937;
            }
            
            .final-total .total-label {
              font-size: 16px;
              color: #1f2937;
              text-transform: uppercase;
            }
            
            .final-total .total-value {
              font-size: 18px;
              color: #059669;
              background: #ecfdf5;
              padding: 8px 15px;
              border-radius: 6px;
              border: 1px solid #10b981;
            }
            
            .bill-footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
            }
            
            .delivery-address {
              line-height: 1.5;
              font-size: 14px;
            }
            
            .delivery-address p {
              margin: 4px 0;
            }
            
            /* Hide action buttons in print */
            .bill-actions,
            .order-success-message {
              display: none !important;
            }
            
            /* Print-specific adjustments */
            @media print {
              body { margin: 0; padding: 0; }
              .bill-container { 
                border: none; 
                box-shadow: none; 
                max-width: 100%;
                margin: 0;
              }
              .bill-header { 
                background: #1e40af !important; 
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .invoice-table thead {
                background: #1f2937 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="bill-container">
      <div id="bill-content">
          {/* Professional Invoice Header */}
        <div className="bill-header">
          <div className="bill-header-content">
            <div className="company-info">
              <h2>🌾 Pavithra Traders</h2>
              <p className="company-tagline">Premium Agricultural Products & Supplies</p>
              <p className="company-contact">
                📧 info@pavithratraders.com | 📞 +91-9876543210<br/>
                🌐 www.pavithratraders.com | 📍 Tamil Nadu, India
              </p>
            </div>
            <div className="invoice-badge">
              <div className="invoice-title">Tax Invoice</div>
              <div className="invoice-date">{orderDate}</div>
              <div style={{ fontSize: '12px', marginTop: '8px', opacity: '0.9' }}>
                INV-{orderData.orderId.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>        {/* Main Content Area */}
        <div className="bill-content-area">
          {/* Order & Customer Details Grid */}
          <div className="bill-details-grid">
            {/* Order Information */}
            <div className="bill-section">
              <h3>Order Details</h3>
              <div className="detail-box">
                <div className="detail-item">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">#{orderData.orderId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{orderDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{orderTime}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{orderData.paymentMethod === 'cod' ? 'Confirmed - COD' : 'Paid'}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bill-section">
              <h3>Customer Details</h3>
              <div className="detail-box">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{orderData.address.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{orderData.address.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bill-section">
            <h3>Delivery Address</h3>
            <div className="detail-box">
              <div className="delivery-address">
                <p><strong>📍 {orderData.address.street}</strong></p>
                {orderData.address.landmark && <p>Near {orderData.address.landmark}</p>}
                <p>{orderData.address.city}, {orderData.address.state} - {orderData.address.pincode}</p>
              </div>
            </div>
          </div>

          {/* Professional Invoice Items Table */}
          <div className="bill-section">
            <h3>Items Ordered</h3>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price per Unit</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => {
                  // Add null safety checks
                  const product = item?.product || {};
                  const productName = product?.name || `Product ${index + 1}`;
                  const productCategory = product?.category || 'N/A';
                  const productPrice = product?.price || 0;
                  const productUnit = product?.unit || 'unit';
                  const quantity = item?.quantity || 1;
                  const itemTotal = productPrice * quantity;
                  
                  return (
                    <tr key={item?._id || product?._id || index}>
                      <td className="item-name">{productName}</td>
                      <td><span className="item-category">{productCategory}</span></td>
                      <td className="item-price">₹{productPrice} per {productUnit}</td>
                      <td>{quantity}</td>
                      <td className="item-total">₹{itemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div className="bill-section">
            <h3>Payment Information</h3>
            <div className="detail-box">
              <div className="detail-item">
                <span className="detail-label">Payment Method</span>
                <span className="detail-value">{
                  orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                  orderData.paymentMethod.toUpperCase() + ' Payment'
                }</span>
              </div>
              {orderData.paymentDetails?.transactionId && (
                <div className="detail-item">
                  <span className="detail-label">Transaction ID</span>
                  <span className="detail-value">{orderData.paymentDetails.transactionId}</span>
                </div>
              )}
              {orderData.paymentDetails?.upiApp && (
                <div className="detail-item">
                  <span className="detail-label">Paid via</span>
                  <span className="detail-value">{orderData.paymentDetails.upiApp}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Total Section */}
          <div className="bill-total-section">
            <div className="total-row">
              <span className="total-label">Subtotal</span>
              <span className="total-value">₹{totalAmount}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Delivery Charges</span>
              <span className="total-value">Free</span>
            </div>
            <div className="total-row final-total">
              <span className="total-label">Total Amount</span>
              <span className="total-value">₹{totalAmount}</span>
            </div>
          </div>

          {/* Professional Footer */}
          <div className="bill-footer">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '30px', 
              marginBottom: '20px',
              textAlign: 'left',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <div>
                <h4 style={{ color: '#1f2937', marginBottom: '10px', fontSize: '16px' }}>Terms & Conditions</h4>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.6' }}>
                  <li>• Goods once sold cannot be returned</li>
                  <li>• Delivery charges may apply for orders below ₹500</li>
                  <li>• Payment terms: As per agreement</li>
                  <li>• Warranty as per manufacturer's terms</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#1f2937', marginBottom: '10px', fontSize: '16px' }}>Business Details</h4>
                <div style={{ lineHeight: '1.6' }}>
                  <p><strong>GSTIN:</strong> 33AABCP1234C1Z5 (Sample)</p>
                  <p><strong>PAN:</strong> AABCP1234C</p>
                  <p><strong>Bank:</strong> State Bank of India</p>
                  <p><strong>A/C No:</strong> 12345678901</p>
                </div>
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px 0', 
              borderTop: '2px solid #e5e7eb',
              fontSize: '16px', 
              color: '#059669',
              fontWeight: '600'
            }}>
              <p>Thank you for choosing Pavithra Traders! 🙏</p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                📧 For queries: <strong>info@pavithratraders.com</strong> | 
                🚚 Delivery: 2-3 business days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Action Buttons */}
      <div className="bill-actions">
        <button className="btn-secondary" onClick={printBill}>
          🖨️ Print Invoice
        </button>
        <button className="btn-secondary" onClick={downloadBill}>
          📄 Download PDF
        </button>
        <button className="btn-primary" onClick={() => {
          // Navigate to home page
          window.location.href = '/';
        }}>
          🛒 Continue Shopping
        </button>
        <button className="btn-outline" onClick={() => {
          // Navigate to orders page
          window.location.href = '/orders';
        }}>
          📋 Track Orders
        </button>
      </div>
      
      {/* Success Message */}
      <div className="order-success-message">
        <div className="success-icon">✅</div>
        <h3>Order Placed Successfully!</h3>
        <p>Your order #{orderData.orderId} has been confirmed and will be processed shortly.</p>
        <p>You will receive SMS updates on your registered mobile number.</p>
      </div>
    </div>
  );
}
