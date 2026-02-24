import React, { useState, useEffect } from 'react';
import '../css/CropCalendarModal.css';
import {
    cropCalendarData,
    regions,
    southIndiaDistricts,
    districtRecommendations,
    cropDetailsDB
} from '../data/cropCalendar.js';

export default function CropCalendarModal({ onClose }) {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isDetailedView, setIsDetailedView] = useState(false);

    // Use regions from the data file, or default to a set list
    const availableRegions = regions || ["North India", "South India", "East India", "West India"];
    const months = Object.keys(cropCalendarData);

    // Clear district when region changes
    useEffect(() => {
        if (selectedRegion !== 'South India') {
            setSelectedDistrict('');
        }
    }, [selectedRegion]);

    const handleGetSuggestions = () => {
        setSuggestions([]);
        setIsDetailedView(false);

        if (!selectedMonth || !selectedRegion) return;

        if (selectedRegion === 'South India') {
            // South India Logic
            if (!selectedDistrict) return; // Should be handled by disabled button, but safe check

            // 1. Try to get specific district data
            let crops = districtRecommendations[selectedDistrict]?.[selectedMonth];

            // 2. Fallback to generic if district specific data missing for that month or district not in map
            if (!crops) {
                // Check if district is in our valid list but just missing data, or if we should use generic South India data from the main object
                // For now, let's use the 'Generic' key from districtRecommendations as a South India fallback
                crops = districtRecommendations["Generic"]?.[selectedMonth] || cropCalendarData[selectedMonth]?.["South India"] || [];
            }

            // 3. Enrich with details
            const detailedCrops = crops.map(cropName => {
                // Find details in DB
                const details = cropDetailsDB[cropName] || cropDetailsDB[cropName.split(' ')[0]] || null;
                return details ? { ...details, displayName: cropName } : { name: cropName, displayName: cropName };
            });

            setSuggestions(detailedCrops);
            setIsDetailedView(true);

        } else {
            // Standard Logic for other regions
            const data = cropCalendarData[selectedMonth]?.[selectedRegion] || [];
            setSuggestions(data);
            setIsDetailedView(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className={`crop-calendar-modal ${isDetailedView ? 'detailed-mode' : ''}`}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <div className="calendar-header">
                    <h2>🌾 Smart Crop Calendar</h2>
                    <p>Get AI-powered crop suggestions based on your location and season</p>
                </div>

                <div className="calendar-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Select Region</label>
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="calendar-select"
                            >
                                <option value="">-- Region --</option>
                                {availableRegions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        {selectedRegion === 'South India' && (
                            <div className="form-group">
                                <label>Select District</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="calendar-select"
                                >
                                    <option value="">-- District --</option>
                                    {southIndiaDistricts.map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Select Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="calendar-select"
                            >
                                <option value="">-- Month --</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        className="get-suggestions-btn"
                        onClick={handleGetSuggestions}
                        disabled={!selectedMonth || !selectedRegion || (selectedRegion === 'South India' && !selectedDistrict)}
                    >
                        Find Suitable Crops 🔍
                    </button>
                </div>

                {suggestions.length > 0 && (
                    <div className="suggestions-result">
                        <h3>Recommended Crops for {selectedMonth} in {selectedRegion} {selectedDistrict ? `(${selectedDistrict})` : ''}:</h3>

                        {isDetailedView ? (
                            <div className="detailed-crop-grid">
                                {suggestions.map((crop, index) => (
                                    <div key={index} className="crop-detail-card">
                                        <div className="crop-card-header">
                                            <h4>{crop.displayName || crop.name}</h4>
                                            {crop.scientificName && <span className="scientific-name">({crop.scientificName})</span>}
                                        </div>

                                        {crop.soil ? (
                                            <div className="crop-card-body">
                                                <div className="detail-item">
                                                    <span className="icon">🌱</span>
                                                    <strong>Soil:</strong> {crop.soil}
                                                </div>
                                                <div className="detail-item">
                                                    <span className="icon">💧</span>
                                                    <strong>Water:</strong> {crop.water}
                                                </div>
                                                <div className="detail-item">
                                                    <span className="icon">🚜</span>
                                                    <strong>Planting:</strong> {crop.planting}
                                                </div>
                                                <div className="detail-item">
                                                    <span className="icon">⏳</span>
                                                    <strong>Duration:</strong> {crop.duration}
                                                </div>
                                                <div className="detail-item">
                                                    <span className="icon">🌾</span>
                                                    <strong>Harvest:</strong> {crop.harvest}
                                                </div>
                                                {crop.description && <p className="crop-desc">{crop.description}</p>}
                                            </div>
                                        ) : (
                                            <div className="crop-card-body">
                                                <p className="no-details">Detailed info not available for this variety.</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="crop-tags">
                                {suggestions.map((crop, index) => (
                                    <span key={index} className="crop-tag">🌱 {crop}</span>
                                ))}
                            </div>
                        )}

                        <div className="suggestion-note">
                            <small>* Recommendations are based on general agricultural data. Consult local experts for specific advice.</small>
                        </div>
                    </div>
                )}

                {selectedMonth && selectedRegion && (selectedRegion === 'South India' ? selectedDistrict : true) && suggestions.length === 0 && (
                    <div className="no-suggestions">
                        <p>No specific data available for this selection.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
