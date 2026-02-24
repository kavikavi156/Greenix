import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import '../css/RentalSystem.css';
import { Link } from 'react-router-dom';
import RentalBooking from './RentalBookingModal.jsx';

export default function RentalMarketplace() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEquip, setSelectedEquip] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchRentals();
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('customerToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.userId,
                    name: payload.name || '',
                    email: payload.email || '',
                    mobile: payload.phone || ''
                });
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    const fetchRentals = async () => {
        try {
            const response = await fetch(getApiUrl('/api/rentals'));
            const data = await response.json();
            if (data.equipment) {
                setEquipmentList(data.equipment);
            }
        } catch (error) {
            console.error('Error fetching rentals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (eq) => {
        if (!user) {
            alert('Please login to book equipment');
            return;
        }
        setSelectedEquip(eq);
    };

    // Filter logic
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Tractor', 'Harvester', 'Drone', 'Implements', 'Irrigation', 'Other'];

    const filteredEquipment = equipmentList.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="rental-page-container">
            {/* Hero Section */}
            <div className="rental-hero">
                <div className="rental-hero-content">
                    <h1>🚜 Modern Farm Equipment Rentals</h1>
                    <p>Access premium agricultural machinery without the heavy investment. Book today and boost your productivity.</p>
                    <div className="rental-search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search tractors, drones, harvesters..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rental-marketplace-content">
                <div className="rental-filters-container">
                    <div className="category-filters">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <Link to="/" className="back-link">← Back to Home</Link>
                </div>

                {loading ? (
                    <div className="loader-container">
                        <div className="loader-spinner"></div>
                        <p>Loading available equipment...</p>
                    </div>
                ) : (
                    <>
                        {filteredEquipment.length > 0 ? (
                            <div className="equipment-grid-premium">
                                {filteredEquipment.map(eq => (
                                    <div key={eq.id} className={`equipment-card-premium ${eq.isBooked ? 'booked-card' : ''}`}>
                                        <div className="card-image-wrapper">
                                            <img src={eq.image} alt={eq.name} style={eq.isBooked ? { filter: 'grayscale(0.8)' } : {}} />
                                            <span className="card-category-badge">{eq.category}</span>
                                            {eq.isBooked ? (
                                                <span className="card-stock-badge booked" style={{ background: '#ef4444' }}>Currently Booked</span>
                                            ) : (
                                                eq.stock < 3 && <span className="card-stock-badge low">Low Stock</span>
                                            )}
                                        </div>
                                        <div className="card-details">
                                            <div className="card-header-row">
                                                <h3 className="card-title">{eq.name}</h3>
                                                <div className="card-rating">
                                                    {eq.isBooked ? '🔴 Booked' : '🟢 Available'}
                                                </div>
                                            </div>

                                            <p className="card-description">
                                                {eq.description.length > 80 ? eq.description.substring(0, 80) + '...' : eq.description}
                                            </p>

                                            <div className="card-features-list">
                                                {eq.features.slice(0, 3).map((feat, idx) => (
                                                    <span key={idx} className="card-feature-pill">✓ {feat}</span>
                                                ))}
                                            </div>

                                            {eq.isBooked && eq.nextAvailableDate && (
                                                <div className="availability-info" style={{
                                                    marginBottom: '10px',
                                                    padding: '8px',
                                                    background: '#fff1f2',
                                                    borderRadius: '8px',
                                                    color: '#be123c',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <span>🕒</span>
                                                    Next available: {new Date(eq.nextAvailableDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            )}

                                            <div className="card-footer-row">
                                                <div className="card-price-block">
                                                    <span className="price-currency">₹</span>
                                                    <span className="price-value">{eq.pricePerDay}</span>
                                                    <span className="price-period">/{eq.pricingUnit ? eq.pricingUnit : 'day'}</span>
                                                </div>
                                                <button
                                                    className={`card-book-btn ${eq.isBooked ? 'booked-action' : ''}`}
                                                    onClick={() => handleBookClick(eq)}
                                                    style={eq.isBooked ? { background: '#f59e0b' } : {}}
                                                >
                                                    {eq.isBooked ? 'Book for Later' : 'Book Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results-state">
                                <h3>No equipment found</h3>
                                <p>Try adjusting your search or filter to find what you're looking for.</p>
                                <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} className="reset-btn">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </>
                )}

                {selectedEquip && (
                    <RentalBooking
                        equipment={selectedEquip}
                        onClose={() => setSelectedEquip(null)}
                        user={user}
                    />
                )}
            </div>
        </div>
    );
}
