import { useState, useEffect } from 'react';
import '../css/ProfessionalAdminDashboard.css'; // Reuse basic layout styles
import { getImageUrl, API_BASE_URL } from '../config/api';
import DealerInvoice from './DealerInvoice';
import CustomerInvoice from './CustomerInvoice';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Create a separate CSS file for Dealer specific overrides if needed, 
// for now we use inline styles mixed with reuse to ensure "good look" immediately.

export default function DealerDashboard({ token, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, requests, profile
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [selectedCustomerInvoiceOrder, setSelectedCustomerInvoiceOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Real-time Simulation
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Request Modal State
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({ productId: '', quantity: '' });
    const [profile, setProfile] = useState(null);
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: { street: '', city: '', state: '', pincode: '' } });

    // Invoice State
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

    useEffect(() => {
        fetchData();
        fetchProducts();

        // Real-time polling every 15 seconds
        const interval = setInterval(() => {
            fetchData(true); // silent fetch
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    async function fetchData(silent = false) {
        if (!silent) setLoading(true);
        try {
            await Promise.all([fetchOrders(), fetchRequests(), fetchProfile(), fetchCustomerOrders()]);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            if (!silent) setLoading(false);
        }
    }

    async function fetchOrders() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dealer-orders/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders', error);
        }
    }

    async function fetchRequests() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dealer-orders/my-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Error fetching requests', error);
        }
    }

    async function fetchCustomerOrders() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dealer-orders/customer-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomerOrders(data);
            }
        } catch (error) {
            console.error('Error fetching customer orders', error);
        }
    }

    async function fetchProfile() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dealer-orders/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setProfileForm({
                    name: data.name,
                    phone: data.phone,
                    address: {
                        street: data.address?.street || '',
                        city: data.address?.city || '',
                        state: data.address?.state || '',
                        pincode: data.address?.pincode || ''
                    }
                });
            }
        } catch (error) { console.error('Error fetching profile', error); }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/dealer-orders/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(profileForm)
            });
            if (res.ok) {
                showNotification('Profile updated successfully!', 'success');
                fetchProfile();
            } else {
                showNotification('Failed to update profile', 'error');
            }
        } catch (error) {
            showNotification('Error updating profile', 'error');
        }
    }

    async function fetchProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || data || []);
            }
        } catch (error) {
            console.error('Error fetching products', error);
        }
    }

    // --- Report Download ---
    function downloadReport(format = 'excel') {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        if (format === 'excel') {
            let csvContent = "data:text/csv;charset=utf-8,";

            // 1. Header
            csvContent += `DEALER BUSINESS REPORT\n`;
            csvContent += `Generated On:,${date} ${time}\n`;
            csvContent += `Dealer:,${profile?.name || 'N/A'}\n\n`;

            // 2. Stats
            csvContent += `SUMMARY STATS\n`;
            csvContent += `Active Orders,${stats.activeOrders}\n`;
            csvContent += `Completed Supply,${stats.completedOrders}\n`;
            csvContent += `Total Items Supplied,${stats.totalItemsSupplied}\n`;
            csvContent += `Customer Sales (Count),${stats.customerSales}\n\n`;

            // 3. Supply Orders
            csvContent += `SUPPLY ORDERS (From Admin)\n`;
            csvContent += `Order ID,Product,Quantity,Status,Date,Payment Status\n`;
            orders.forEach(o => {
                const row = [
                    o._id.slice(-6).toUpperCase(),
                    o.product?.name || 'Unknown',
                    o.quantity,
                    o.status,
                    new Date(o.createdAt).toLocaleDateString(),
                    o.paymentStatus || 'PENDING'
                ];
                csvContent += row.join(",") + "\n";
            });
            csvContent += `\n`;

            // 4. Customer Sales
            csvContent += `CUSTOMER SALES (End Users)\n`;
            csvContent += `Order ID,Customer,Items Count,Total Amount,Status,Date\n`;
            customerOrders.forEach(o => {
                const row = [
                    o._id.slice(-6).toUpperCase(),
                    o.user?.name || 'Guest',
                    o.items.length,
                    o.totalAmount.toFixed(2),
                    o.status,
                    new Date(o.createdAt).toLocaleDateString()
                ];
                csvContent += row.join(",") + "\n";
            });

            // Trigger Download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Dealer_Report_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('Dealer Business Report', 14, 22);
            doc.setFontSize(11);
            doc.text(`Generated On: ${date} ${time}`, 14, 30);
            doc.text(`Dealer: ${profile?.name || 'N/A'}`, 14, 36);

            // Stats
            doc.setFontSize(14);
            doc.text('Summary Stats', 14, 46);
            doc.autoTable({
                startY: 50,
                head: [['Metric', 'Value']],
                body: [
                    ['Active Orders', stats.activeOrders],
                    ['Completed Supply', stats.completedOrders],
                    ['Total Items Supplied', stats.totalItemsSupplied],
                    ['Customer Sales (Count)', stats.customerSales]
                ],
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
                margin: { bottom: 10 }
            });

            let currentY = doc.lastAutoTable.finalY + 10;

            // Supply Orders
            doc.setFontSize(14);
            doc.text('Supply Orders (From Admin)', 14, currentY);
            doc.autoTable({
                startY: currentY + 4,
                head: [['Order ID', 'Product', 'Quantity', 'Status', 'Date', 'Payment Status']],
                body: orders.map(o => [
                    o._id.slice(-6).toUpperCase(),
                    o.product?.name || 'Unknown',
                    o.quantity,
                    o.status,
                    new Date(o.createdAt).toLocaleDateString(),
                    o.paymentStatus || 'PENDING'
                ]),
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                margin: { bottom: 10 }
            });

            currentY = doc.lastAutoTable.finalY + 10;

            // Customer Sales
            doc.setFontSize(14);
            doc.text('Customer Sales (End Users)', 14, currentY);
            doc.autoTable({
                startY: currentY + 4,
                head: [['Order ID', 'Customer', 'Items Count', 'Total Amount', 'Status', 'Date']],
                body: customerOrders.map(o => [
                    o._id.slice(-6).toUpperCase(),
                    o.user?.name || 'Guest',
                    o.items.length,
                    `Rs. ${o.totalAmount.toFixed(2)}`,
                    o.status,
                    new Date(o.createdAt).toLocaleDateString()
                ]),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });

            doc.save(`Dealer_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        }
    }

    // --- Actions ---

    async function handleSubmitRequest(e) {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/dealer-orders/request-stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(requestForm)
            });

            if (res.ok) {
                showNotification('Stock request submitted successfully!', 'success');
                setShowRequestModal(false);
                setRequestForm({ productId: '', quantity: '' });
                fetchRequests();
            } else {
                const error = await res.json();
                showNotification(error.error || 'Failed to submit request', 'error');
            }
        } catch (error) {
            showNotification('Error submitting request', 'error');
        }
    }

    async function updateOrderStatus(orderId, action) {
        let endpoint;
        let confirmMsg = null;

        if (action === 'confirm') endpoint = 'confirm-order';
        else if (action === 'deliver') {
            endpoint = 'deliver-order';
            confirmMsg = "Confirm delivery? This will update stock.";
        } else if (action === 'reject') {
            endpoint = 'reject-order';
            confirmMsg = "Are you sure you want to reject this order?";
        } else if (action === 'mark-paid') {
            endpoint = 'mark-paid';
            confirmMsg = "Confirm that you have paid the admin for this order?";
        }

        if (confirmMsg && !window.confirm(confirmMsg)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/dealer-orders/${endpoint}/${orderId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                let successMsg;
                if (action === 'confirm') successMsg = 'Order confirmed! Ready to ship.';
                else if (action === 'deliver') successMsg = 'Delivery confirmed!';
                else if (action === 'reject') successMsg = 'Order rejected.';
                else if (action === 'mark-paid') successMsg = 'Order marked as PAID.';

                showNotification(successMsg, 'success');
                fetchOrders();
            } else {
                showNotification('Failed to update order status', 'error');
            }
        } catch (error) {
            showNotification('Error updating order', 'error');
        }
    }

    function showNotification(message, type = 'success') {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }

    // --- Stats Calculation ---
    const stats = {
        activeOrders: orders.filter(o => ['APPROVED', 'PROCESSING', 'DISPATCHED'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length,
        pendingRequests: requests.filter(r => r.status === 'PENDING_ADMIN_APPROVAL').length,

        totalItemsSupplied: orders.reduce((acc, curr) => (curr.status === 'COMPLETED' || curr.status === 'DELIVERED') ? acc + curr.quantity : acc, 0),
        customerSales: customerOrders.length
    };

    if (loading) return <div className="admin-loading"><div className="loading-spinner"></div><p>Loading Dealer Portal...</p></div>;

    // Render Invoice/Bill Preview
    if (selectedInvoiceOrder) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ margin: '40px 20px', width: '100%', maxWidth: '850px', position: 'relative' }}>
                    <button
                        onClick={() => setSelectedInvoiceOrder(null)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '-50px',
                            background: 'white',
                            color: '#ef4444',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        ✕
                    </button>
                    {/* Pass dealer profile as well since it's the current user */}
                    <DealerInvoice order={selectedInvoiceOrder} dealer={profile} />
                </div>
            </div>
        );
    }


    // Render Customer Invoice Preview
    if (selectedCustomerInvoiceOrder) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ margin: '40px 20px', width: '100%', maxWidth: '850px', position: 'relative' }}>
                    <button
                        onClick={() => setSelectedCustomerInvoiceOrder(null)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '-50px',
                            background: 'white',
                            color: '#ef4444',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        ✕
                    </button>
                    <CustomerInvoice order={selectedCustomerInvoiceOrder} />
                </div>
            </div>
        );
    }

    return (
        <div className="professional-admin">
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Dealer Sidebar */}
            <div className="admin-sidebar" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="sidebar-header" style={{ borderBottom: '1px solid #334155' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🏪</span> Dealer Portal
                    </h2>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard Overview
                    </button>
                    <button
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        📦 Assigned Orders
                        {stats.activeOrders > 0 && <span className="badge" style={{ marginLeft: 'auto', background: '#10b981', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{stats.activeOrders}</span>}
                    </button>
                    <button
                        className={activeTab === 'requests' ? 'active' : ''}
                        onClick={() => setActiveTab('requests')}
                    >
                        📝 Stock Requests
                    </button>
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 My Profile
                    </button>
                    <button onClick={onLogout} className="logout-btn">
                        🚪 Logout
                    </button>
                </nav>
                <div style={{ padding: '20px', fontSize: '12px', color: '#64748b', marginTop: 'auto' }}>
                    <p>Live Updates Active 🟢</p>
                    <p>Last Sync: {lastUpdated.toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-main">

                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 style={{ fontSize: '28px' }}>Welcome, Partner!</h1>
                        <p style={{ color: '#64748b', marginTop: '5px' }}>Manage your supply chain and orders efficiently.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowRequestModal(true)} className="action-btn" style={{ background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>+</span> New Supply/Stock Request
                        </button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => downloadReport('pdf')} className="action-btn" style={{ background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📄</span> Download PDF
                            </button>
                            <button onClick={() => downloadReport('excel')} className="action-btn" style={{ background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📊</span> Download Excel
                            </button>
                        </div>
                        <button onClick={() => fetchData()} className="refresh-btn">
                            🔄 Sync
                        </button>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        {/* Stats Grid */}
                        <div className="stats-grid">
                            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                                <div className="stat-icon" style={{ background: '#eff6ff', color: '#10b981' }}>📦</div>
                                <div className="stat-info">
                                    <h3>Active Orders</h3>
                                    <p className="stat-number">{stats.activeOrders}</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                                <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>✅</div>
                                <div className="stat-info">
                                    <h3>Completed Supply</h3>
                                    <p className="stat-number">{stats.completedOrders}</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>⏳</div>
                                <div className="stat-info">
                                    <h3>Pending Requests</h3>
                                    <p className="stat-number">{stats.pendingRequests}</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>📊</div>
                                <div className="stat-info">
                                    <h3>Total Supplied</h3>
                                    <p className="stat-number">{stats.totalItemsSupplied} <span style={{ fontSize: '14px', fontWeight: '400', color: '#64748b' }}>units</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Section */}
                        <div className="content-section" style={{ marginTop: '30px' }}>
                            <div className="section-header">
                                <h2 style={{ fontSize: '20px' }}>📢 Recent Activity</h2>
                            </div>
                            {orders.length === 0 && requests.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    No activity yet. Start by making a stock request!
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Product</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 3).map(order => (
                                                <tr key={order._id}>
                                                    <td><span className="status-badge processing">Order Assigned</span></td>
                                                    <td>{order.product?.name}</td>
                                                    <td>{order.status}</td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {requests.slice(0, 3).map(req => (
                                                <tr key={req._id}>
                                                    <td><span className="status-badge pending">Stock Request</span></td>
                                                    <td>{req.product?.name}</td>
                                                    <td>{req.status}</td>
                                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'profile' && (
                    <div className="content-section">
                        <div className="section-header">
                            <h2>👤 My Dealer Profile</h2>
                        </div>
                        <div className="profile-container" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                            <div className="profile-card" style={{ flex: '1', minWidth: '300px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#10b981', margin: '0 auto 16px' }}>
                                        🏪
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a' }}>{profile?.name || 'Dealer'}</h3>
                                    <div style={{ color: '#64748b' }}>{profile?.email}</div>
                                    <span className="stock-badge normal" style={{ marginTop: '12px', display: 'inline-block' }}>Active Partner</span>
                                </div>

                                <form onSubmit={handleUpdateProfile}>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Business Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Contact Phone</label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>

                                    <h4 style={{ margin: '24px 0 16px 0', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Store Address</h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Street</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.street}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>City</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.city}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, city: e.target.value } })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>State</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.state}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, state: e.target.value } })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Pincode</label>
                                            <input
                                                type="text"
                                                value={profileForm.address.pincode}
                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, pincode: e.target.value } })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '24px', background: '#0f172a', color: 'white' }}>
                                        Save Changes
                                    </button>
                                </form>
                            </div>

                            <div className="support-card" style={{ flex: '1', minWidth: '300px', maxHeight: '250px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '30px', borderRadius: '12px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>Need Support?</h3>
                                <p style={{ margin: '0 0 24px 0', lineHeight: '1.6', opacity: '0.9' }}>
                                    Contact the administration for any stock discrepancies or urgent order modifications.
                                </p>
                                <button style={{ background: 'white', color: '#059669', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', width: 'fit-content' }} onClick={() => window.open('mailto:support@greenix.com')}>
                                    ✉️ Contact Admin
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'orders' && (
                    <div className="content-section">
                        <div className="section-header">
                            <h2>📦 Order Management</h2>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Total Amt</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => {
                                        const orderTotal = order.totalAmount || (order.quantity * (order.product?.price || 0));
                                        return (
                                            <tr key={order._id}>
                                                <td style={{ fontWeight: '600' }}>#{order._id.slice(-6).toUpperCase()}</td>
                                                <td>
                                                    <div className="product-info-cell">
                                                        {order.product?.image && <img src={getImageUrl(order.product.image)} alt={order.product.name} className="product-thumb" />}
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontWeight: '500' }}>{order.product?.name || 'Unknown'}</span>
                                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Stock ID: {order.product?._id?.slice(-4)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 'bold' }}>{order.quantity}</td>
                                                <td style={{ fontWeight: 'bold' }}>₹{orderTotal.toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                        {order.status === 'PENDING_ADMIN_APPROVAL' ? 'WAITING APPROVAL' : order.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    {order.status === 'COMPLETED' ? (
                                                        <span className={`status-badge ${order.paymentStatus === 'PAID' ? 'completed' : 'pending'}`} style={{ background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2', color: order.paymentStatus === 'PAID' ? '#166534' : '#991b1b' }}>
                                                            {order.paymentStatus || 'PENDING'}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#cbd5e1' }}>-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {order.status === 'COMPLETED' && order.paymentStatus !== 'PAID' && (
                                                            <button
                                                                onClick={() => updateOrderStatus(order._id, 'mark-paid')}
                                                                className="edit-btn"
                                                                style={{ backgroundColor: '#8b5cf6', fontSize: '12px', padding: '4px 8px' }}
                                                            >
                                                                💰 Mark Paid
                                                            </button>
                                                        )}
                                                        {order.status === 'APPROVED' && (
                                                            <button onClick={() => updateOrderStatus(order._id, 'confirm')} className="edit-btn" style={{ backgroundColor: '#10b981' }}>
                                                                🚀 Confirm Supply
                                                            </button>
                                                        )}
                                                        {order.status === 'PROCESSING' && (
                                                            <button onClick={() => updateOrderStatus(order._id, 'deliver')} className="edit-btn" style={{ backgroundColor: '#10b981' }}>
                                                                📦 Mark Delivered
                                                            </button>
                                                        )}
                                                        {(order.status === 'APPROVED' || order.status === 'PROCESSING') && (
                                                            <button onClick={() => updateOrderStatus(order._id, 'reject')} className="delete-btn">
                                                                ✕ Reject
                                                            </button>
                                                        )}
                                                        {order.status === 'DELIVERED' && <span style={{ color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>✅ Delivered</span>}
                                                        {order.status === 'COMPLETED' && (
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <span style={{ color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>✅ Completed</span>
                                                                <button onClick={() => setSelectedInvoiceOrder(order)} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    📄 Bill
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                                No orders assigned yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="content-section">
                        <div className="section-header">
                            <h2>📝 My Stock Requests</h2>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Product</th>
                                        <th>Requested Qty</th>
                                        <th>Status</th>
                                        <th>Submitted Date</th>
                                        <th>Admin Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req._id}>
                                            <td style={{ color: '#64748b' }}>#{req._id.slice(-6).toUpperCase()}</td>
                                            <td>
                                                <div className="product-info-cell">
                                                    <span style={{ fontWeight: '500' }}>{req.product?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>{req.requestedQuantity}</td>
                                            <td>
                                                <span className={`status-badge ${req.status === 'PENDING_ADMIN_APPROVAL' ? 'pending' : req.status.toLowerCase()}`}>
                                                    {req.status === 'PENDING_ADMIN_APPROVAL' ? 'PENDING' : req.status}
                                                </span>
                                            </td>
                                            <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {req.adminNote ? (
                                                    <span style={{ color: '#ef4444' }}>{req.adminNote}</span>
                                                ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                                No stock requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* Enhanced Request Modal */}
            {
                showRequestModal && (
                    <div
                        className="admin-modal-overlay"
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 9999
                        }}
                        onClick={() => setShowRequestModal(false)}
                    >
                        <div
                            className="admin-modal-card"
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                width: '500px',
                                maxWidth: '90%',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                overflow: 'hidden',
                                animation: 'modalFadeIn 0.2s ease-out'
                            }}
                        >
                            <div className="admin-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '600' }}>New Stock Request</h3>
                                <button className="close-btn" onClick={() => setShowRequestModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <form onSubmit={handleSubmitRequest}>
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Select Product</label>
                                        <select
                                            value={requestForm.productId}
                                            onChange={e => setRequestForm({ ...requestForm, productId: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                        >
                                            <option value="">-- Choose Product --</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>{p.name} (Current Stock: {p.stock})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Quantity to Supply</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={requestForm.quantity}
                                            onChange={e => setRequestForm({ ...requestForm, quantity: e.target.value })}
                                            required
                                            placeholder="Enter quantity"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                    <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                                        📩 Submit Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
