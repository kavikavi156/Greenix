
import React from 'react';

export default function CustomerInvoice({ order }) {
    if (!order) return null;

    const companyDetails = {
        name: "Pavithra Traders",
        address: "123 Agri Market, Tamil Nadu, India",
        gst: "33AABCP1234C1Z5",
        email: "support@pavithratraders.com",
        phone: "+91 98765 43210"
    };

    const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    // Helper to calculate totals properly handles cancelled items dynamically if needed, 
    // but order.totalAmount should be correct from backend.
    // We will list all items but mark cancelled ones.

    return (
        <div className="invoice-container" style={{
            maxWidth: '800px',
            margin: '20px auto',
            padding: '40px',
            background: 'white',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#333'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#166534', fontSize: '28px' }}>INVOICE</h1>
                    <p style={{ margin: '5px 0', color: '#64748b' }}>Order #{order._id.slice(-6).toUpperCase()}</p>
                    <div style={{ marginTop: '10px' }}>
                        <span style={{
                            background: order.paymentStatus === 'completed' ? '#dcfce7' : '#fee2e2',
                            color: order.paymentStatus === 'completed' ? '#166534' : '#991b1b',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            textTransform: 'uppercase'
                        }}>
                            {order.paymentStatus || 'PENDING'}
                        </span>
                        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#64748b' }}>
                            {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'COD'}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>{companyDetails.name}</h3>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{companyDetails.address}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>GSTIN: {companyDetails.gst}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{companyDetails.email}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{companyDetails.phone}</p>
                </div>
            </div>

            {/* Bill To */}
            <div style={{ marginBottom: '40px' }}>
                <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', margin: '0 0 10px 0' }}>Bill To</h4>
                <h3 style={{ margin: '0 0 5px 0' }}>{order.deliveryAddress?.fullName || order.user?.name || 'Customer'}</h3>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>{order.deliveryAddress?.address}</p>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                </p>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>Phone: {order.deliveryAddress?.phone}</p>
            </div>

            {/* Line Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontSize: '14px' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '12px', color: '#475569', fontSize: '14px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '12px', color: '#475569', fontSize: '14px' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '12px', color: '#475569', fontSize: '14px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px' }}>
                                <div style={{ fontWeight: '500' }}>
                                    {item.product?.name || item.name || 'Product'}
                                    {item.status === 'cancelled' && <span style={{ color: 'red', marginLeft: '5px' }}>(Cancelled)</span>}
                                </div>
                            </td>
                            <td style={{ textAlign: 'center', padding: '12px' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', padding: '12px' }}>₹{item.price}</td>
                            <td style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}>
                                {item.status === 'cancelled' ? (
                                    <span style={{ textDecoration: 'line-through', color: '#999' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                ) : (
                                    `₹${(item.price * item.quantity).toFixed(2)}`
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a', borderTop: '2px solid #0f172a' }}>
                        <span>Grand Total:</span>
                        <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '1px dashed #cbd5e1', color: order.paymentStatus === 'PAID' ? '#166534' : '#ef4444' }}>
                        <span>Amount to Pay:</span>
                        <span>₹{order.paymentStatus === 'PAID' ? '0.00' : order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <p>Thank you for shopping with Pavithra Traders!</p>
                <p>For support, email us at support@pavithratraders.com</p>
            </div>

            <div className="no-print" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Invoice</button>
            </div>

            <style>
                {`
                    @media print {
                        body { background: white; margin: 0; padding: 0; }
                        .invoice-container { box-shadow: none; margin: 0; width: 100%; max-width: 100%; padding: 20px; }
                        .no-print { display: none !important; }
                    }
                `}
            </style>
        </div>
    );
}
