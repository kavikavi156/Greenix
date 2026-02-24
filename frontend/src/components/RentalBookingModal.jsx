import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import '../css/RentalSystem.css';

export default function RentalBookingModal({ equipment, onClose, user }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: ''
    });

    const isHourly = equipment.pricingUnit === 'hour';

    // Calculate costs
    const calculateTotal = () => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);

        let quantity = 0;
        let unitLabel = 'days';

        if (isHourly) {
            // Hours
            quantity = Math.ceil(diffTime / (1000 * 60 * 60));
            if (quantity <= 0) quantity = 1;
            unitLabel = 'hours';
        } else if (equipment.pricingUnit === 'week') {
            // Weeks
            quantity = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
            if (quantity <= 0) quantity = 1;
            unitLabel = 'weeks';
        } else if (equipment.pricingUnit === 'month') {
            // Months (Approx 30 days)
            quantity = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
            if (quantity <= 0) quantity = 1;
            unitLabel = 'months';
        } else {
            // Days
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            quantity = diffDays > 0 ? diffDays : 1;
            unitLabel = 'days';
        }

        if (quantity <= 0) return null;

        const rentalCost = quantity * equipment.pricePerDay;
        const platformFee = Math.round(rentalCost * 0.10);
        const securityDeposit = 5000;

        return {
            quantity,
            unitLabel,
            rentalCost,
            platformFee,
            securityDeposit,
            total: rentalCost + platformFee + securityDeposit
        };
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBooking = async () => {
        if (!user) {
            setError('Please login to book equipment');
            return;
        }

        // Basic Validation
        if (!startDate || !endDate || !address.street || !address.city || !address.state || !address.pincode) {
            setError('Please fill in all required fields including State');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            setError('End date must be after start date');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Create Booking & Get Razorpay Order
            const response = await fetch(getApiUrl('/api/rentals/book'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
                },
                body: JSON.stringify({
                    equipmentId: equipment.id,
                    startDate,
                    endDate,
                    deliveryAddress: address
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Booking initialization failed');
                setLoading(false);
                return;
            }

            // 2. Load Razorpay
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load payment gateway');
                setLoading(false);
                return;
            }

            // 3. Open Razorpay
            const options = {
                key: data.key,
                amount: data.totalCost * 100,
                currency: 'INR',
                name: 'Greenix Rentals',
                description: `Rental for ${equipment.name}`,
                order_id: data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        const verifyRes = await fetch(getApiUrl('/api/rentals/verify-payment'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('customerToken')}`
                            },
                            body: JSON.stringify({
                                bookingId: data.bookingId,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            alert('Payment Successful! Booking Confirmed.');
                            onClose();
                        } else {
                            setError(verifyData.error || 'Payment verification failed');
                        }
                    } catch (err) {
                        setError('Payment verification failed');
                    }
                },
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.mobile || ''
                },
                theme: {
                    color: '#16a34a'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
            setError('Failed to process booking');
            setLoading(false);
        }
    };

    const costs = calculateTotal();

    return (
        <div className="rental-modal-overlay">
            <div className="rental-modal">
                <div className="modal-header">
                    <h3>Book {equipment.name}</h3>
                    <button onClick={onClose} className="close-modal-btn">&times;</button>
                </div>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <div className="booking-form">
                    <div className="form-group">
                        <label>Start {isHourly ? 'Time' : 'Date'}</label>
                        <input
                            type={isHourly ? "datetime-local" : "date"}
                            min={equipment.nextAvailableDate ? new Date(equipment.nextAvailableDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>End {isHourly ? 'Time' : 'Date'}</label>
                        <input
                            type={isHourly ? "datetime-local" : "date"}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <h4>Delivery Address</h4>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Street Address *"
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        />
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="City *"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            style={{ flex: 1 }}
                        />
                        <input
                            type="text"
                            placeholder="State *"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            style={{ flex: 1 }}
                        />
                        <input
                            type="text"
                            placeholder="Pincode *"
                            value={address.pincode}
                            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                            style={{ width: '100px' }}
                        />
                    </div>
                </div>

                {costs && (
                    <div className="cost-summary">
                        <div className="summary-row">
                            <span>Rental Charges ({costs.quantity} {costs.unitLabel})</span>
                            <span>₹{costs.rentalCost}</span>
                        </div>
                        <div className="summary-row">
                            <span>Platform Fee (10%)</span>
                            <span>₹{costs.platformFee}</span>
                        </div>
                        <div className="summary-row">
                            <span>Security Deposit (Refundable)</span>
                            <span>₹{costs.securityDeposit}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Payable</span>
                            <span>₹{costs.total}</span>
                        </div>
                    </div>
                )}

                <button
                    className="confirm-booking-btn"
                    onClick={handleBooking}
                    disabled={loading || !costs}
                >
                    {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
            </div>
        </div>
    );
}
