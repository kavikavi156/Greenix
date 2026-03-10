import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { Link, useNavigate } from 'react-router-dom';
import '../css/RentalSystem.css';

const STATUS_COLORS = {
    pending: { bg: '#fef9c3', color: '#854d0e', label: '⏳ Pending' },
    confirmed: { bg: '#dcfce7', color: '#166534', label: '✅ Confirmed' },
    completed: { bg: '#dbeafe', color: '#1e40af', label: '🏁 Completed' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: '❌ Cancelled' }
};

const UNIT_LABELS = { hour: 'hour(s)', day: 'day(s)', week: 'week(s)', month: 'month(s)' };

export default function MyRentals() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelId, setCancelId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('customerToken');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch(getApiUrl('/api/rentals/my-bookings'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to load rentals');
            const data = await response.json();
            setRentals(data.bookings || []);
        } catch (err) {
            setError('Could not load your rentals. Please try again.');
            console.error('Error fetching rentals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setCancelId(bookingId);
        try {
            const token = localStorage.getItem('customerToken');
            const res = await fetch(getApiUrl(`/api/rentals/cancel/${bookingId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                setRentals(prev =>
                    prev.map(r => r._id === bookingId ? { ...r, status: 'cancelled' } : r)
                );
            } else {
                const d = await res.json();
                alert(d.error || 'Failed to cancel booking');
            }
        } catch {
            alert('Failed to cancel booking. Please try again.');
        } finally {
            setCancelId(null);
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="my-rentals-page">
            {/* Header */}
            <div className="my-rentals-header">
                <div className="my-rentals-header-inner">
                    <Link to="/" className="back-link">← Home</Link>
                    <h1>🚜 My Equipment Rentals</h1>
                    <Link to="/rentals" className="browse-btn">Browse Equipment</Link>
                </div>
            </div>

            <div className="my-rentals-body">
                {loading ? (
                    <div className="rentals-loading">
                        <div className="loader-spinner" />
                        <p>Loading your rentals...</p>
                    </div>
                ) : error ? (
                    <div className="rentals-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button onClick={fetchRentals} className="retry-btn">Retry</button>
                    </div>
                ) : rentals.length === 0 ? (
                    <div className="no-rentals-state">
                        <div className="no-rentals-icon">🚜</div>
                        <h2>No Rentals Yet</h2>
                        <p>You haven't booked any equipment yet. Start renting today!</p>
                        <Link to="/rentals" className="start-renting-btn">Browse Available Equipment</Link>
                    </div>
                ) : (
                    <div className="rentals-list-grid">
                        {rentals.map((rental) => {
                            const statusInfo = STATUS_COLORS[rental.status] || STATUS_COLORS.pending;
                            const unitLabel = UNIT_LABELS[rental.pricingUnit] || 'day(s)';
                            const canCancel = rental.status === 'pending' || rental.status === 'confirmed';

                            return (
                                <div key={rental._id} className="rental-detail-card">
                                    {/* Image + Badge */}
                                    <div className="rental-card-img-wrap">
                                        <img
                                            src={rental.image || 'https://images.unsplash.com/photo-1592860523458-941926674681?w=400'}
                                            alt={rental.equipmentName}
                                            className="rental-card-img"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1592860523458-941926674681?w=400'; }}
                                        />
                                        <span
                                            className="rental-status-badge"
                                            style={{ background: statusInfo.bg, color: statusInfo.color }}
                                        >
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="rental-card-details">
                                        <h3 className="rental-equip-name">{rental.equipmentName}</h3>

                                        <div className="rental-info-grid">
                                            <div className="rental-info-row">
                                                <span className="rental-info-label">📅 Start Date</span>
                                                <span className="rental-info-value">{formatDate(rental.startDate)}</span>
                                            </div>
                                            <div className="rental-info-row">
                                                <span className="rental-info-label">📅 End Date</span>
                                                <span className="rental-info-value">{formatDate(rental.endDate)}</span>
                                            </div>
                                            <div className="rental-info-row">
                                                <span className="rental-info-label">⏱ Duration</span>
                                                <span className="rental-info-value">{rental.totalDays} {unitLabel}</span>
                                            </div>
                                            <div className="rental-info-row">
                                                <span className="rental-info-label">💰 Rate</span>
                                                <span className="rental-info-value">₹{rental.pricePerDay}/{rental.pricingUnit || 'day'}</span>
                                            </div>
                                            <div className="rental-info-row">
                                                <span className="rental-info-label">📦 Booked On</span>
                                                <span className="rental-info-value">{formatDate(rental.bookingDate)}</span>
                                            </div>
                                            {rental.deliveryAddress?.city && (
                                                <div className="rental-info-row">
                                                    <span className="rental-info-label">📍 Delivery</span>
                                                    <span className="rental-info-value">
                                                        {rental.deliveryAddress.city}, {rental.deliveryAddress.state} - {rental.deliveryAddress.pincode}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cost Breakdown */}
                                        <div className="rental-cost-box">
                                            <div className="cost-row">
                                                <span>Rental Cost</span>
                                                <span>₹{rental.totalCost - Math.round(rental.totalCost * 0.083) - 5000 > 0 ? (rental.totalCost - 5000 - Math.round((rental.totalCost - 5000) / 1.10 * 0.10)).toLocaleString('en-IN') : '—'}</span>
                                            </div>
                                            <div className="cost-row">
                                                <span>Security Deposit</span>
                                                <span>₹5,000</span>
                                            </div>
                                            <div className="cost-row cost-total">
                                                <span>Total Paid</span>
                                                <span>₹{rental.totalCost?.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {canCancel && (
                                            <button
                                                className="cancel-rental-btn"
                                                onClick={() => handleCancel(rental._id)}
                                                disabled={cancelId === rental._id}
                                            >
                                                {cancelId === rental._id ? 'Cancelling...' : '❌ Cancel Booking'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
