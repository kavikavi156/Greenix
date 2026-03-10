
import React from 'react';
import { getImageUrl } from '../config/api';

/**
 * DealerInvoice Component
 * Renders a printable invoice for Dealer <-> Admin transactions.
 * Designed to be opened in a new window or modal.
 */
export default function DealerInvoice({ order, dealer }) {
    if (!order) return null;

    const companyDetails = {
        name: "Pavithra Traders (Admin)",
        address: "123 Agri Market, Tamil Nadu, India",
        gst: "33AABCP1234C1Z5",
        email: "admin@pavithratraders.com"
    };

    const invoiceDate = order.transactionDate ? new Date(order.transactionDate).toLocaleDateString() : new Date().toLocaleDateString();

    // Calculate totals
    const itemTotal = order.totalAmount || (order.quantity * (order.product?.price || 0));
    const taxRate = 0.05; // Assuming 5% GST for agri products (example)
    const taxAmount = itemTotal * taxRate;
    const finalTotal = itemTotal + taxAmount;

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
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>PAYMENT ADVICE</h1>
                    <p style={{ margin: '5px 0', color: '#64748b' }}>#{order.paymentId || 'PENDING'}</p>
                    <div style={{ marginTop: '10px' }}>
                        <span style={{
                            background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2',
                            color: order.paymentStatus === 'PAID' ? '#166534' : '#991b1b',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            {order.paymentStatus || 'UNPAID'}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>{companyDetails.name}</h3>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{companyDetails.address}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>GSTIN: {companyDetails.gst}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{companyDetails.email}</p>
                </div>
            </div>

            {/* Bill To / From */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', margin: '0 0 10px 0' }}>Vendor (Dealer)</h4>
                    <h3 style={{ margin: '0 0 5px 0' }}>{dealer?.name || 'Authorized Dealer'}</h3>
                    <p style={{ margin: '2px 0', fontSize: '14px' }}>{dealer?.email}</p>
                    <p style={{ margin: '2px 0', fontSize: '14px' }}>{dealer?.phone}</p>
                    <p style={{ margin: '2px 0', fontSize: '14px' }}>{dealer?.address?.city || ''}</p>
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '12px', margin: '0 0 10px 0' }}>Transaction Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', fontSize: '14px' }}>
                        <strong style={{ color: '#475569' }}>Order ID:</strong> <span>#{order._id.slice(-6).toUpperCase()}</span>
                        <strong style={{ color: '#475569' }}>Date:</strong> <span>{invoiceDate}</span>
                        <strong style={{ color: '#475569' }}>Method:</strong> <span>Bank Transfer / UPI</span>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontSize: '14px' }}>Item Description</th>
                        <th style={{ textAlign: 'center', padding: '12px', color: '#475569', fontSize: '14px' }}>Quantity</th>
                        <th style={{ textAlign: 'right', padding: '12px', color: '#475569', fontSize: '14px' }}>Unit Price</th>
                        <th style={{ textAlign: 'right', padding: '12px', color: '#475569', fontSize: '14px' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '500' }}>{order.product?.name || 'Agricultural Product'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{order.product?.brand || 'Premium Brand'}</div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px' }}>{order.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '12px' }}>₹{order.product?.price || order.product?.basePrice || 0}</td>
                        <td style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}>₹{itemTotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                        <span>Subtotal:</span>
                        <span>₹{itemTotal.toFixed(2)}</span>
                    </div>
                    {/* 
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                        <span>Tax (5%):</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                        <span>Total Paid:</span>
                        <span>₹{itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <p>This is a computer-generated receipt and requires no signature.</p>
                <p>Pavithra Traders • 123 Agri Market • support@pavithratraders.com</p>
            </div>

            <div className="no-print" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Invoice</button>
                <button onClick={() => window.close()} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
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
