import { GoogleMap, useJsApiLoader, Marker, GroundOverlay } from "@react-google-maps/api";
import React, { useState } from "react";
import '../css/MapStyles.css';
import axios from 'axios';

const containerStyle = {
    width: '1510px',
    height: '500px'
};

const center = {
    lat: 44.032052,
    lng: -65.488756
};

const libraries = ['drawing'];

export default function Map() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
        libraries: libraries
    });

    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState({
        advanceNoticeNumber: 1,
        advanceNoticeUnit: 'hours',
        phoneType: 'Cell Phone',
        provider: 'Select Provider',
        phoneNumber: '',
        showHistory: false,
        selectedDate: '',
        latitude: '',
        longitude: '',
        mode: 'vegetation', // For Vegetation or Thermal overlay
    });
    const [historicalDates, setHistoricalDates] = useState([]);
    const [futureOverpassData, setFutureOverpassData] = useState(null);
    const [historicalOverpassData, setHistoricalOverpassData] = useState(null);
    const [eviData, setEviData] = useState(null);
    const [eviOverlayUrl, setEviOverlayUrl] = useState(null);

    // Handles click event to drop a marker on the map
    const onMapClick = (e) => {
        setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        setPopupData({ ...popupData, latitude: e.latLng.lat(), longitude: e.latLng.lng() });
    };

    // Handles changes to input fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPopupData({ ...popupData, [name]: value });

        // Automatically pans the map when latitude or longitude changes
        if (name === 'latitude' || name === 'longitude') {
            const lat = name === 'latitude' ? parseFloat(value) : parseFloat(popupData.latitude);
            const lng = name === 'longitude' ? parseFloat(value) : parseFloat(popupData.longitude);

            // Pan the map to the new coordinates. Then update the marker position
            if (map && !isNaN(lat) && !isNaN(lng)) {
                map.panTo({ lat, lng });
                setMarker({ lat, lng });
            }
        }
    };

    // Function to handle submitting notification details
    const handleSubmit = () => {
        if (popupData.showHistory) {
            calculateHistoricalDates();
        }
        setShowPopup(false);  // Close popup after submit
        handleReset(); // Reset coordinates after a notification is added
    };

    // Function to handle adding a marker based on latitude/longitude input fields
    const handleLatLongSubmit = () => {
        setMarker({ lat: parseFloat(popupData.latitude), lng: parseFloat(popupData.longitude) });
        setShowPopup(true);
    };

    // Resets the latitude and longitude fields
    const handleReset = () => {
        setPopupData({
            ...popupData,
            latitude: '',
            longitude: ''
        });

        // Reset the marker and pan the map back to the default center
        setMarker(null);
        if (map) {
            map.panTo(center);  // Pan back to the default center
        }

        // Clear futureOverpassData, historicalOverpassData, and eviData
        setFutureOverpassData(null);
        setHistoricalOverpassData(null);
        setEviData(null);
        setEviOverlayUrl(null);
    };

    // Function to calculate historical overpasses
    const calculateHistoricalDates = () => {
        const dates = [];
        const startDate = new Date();
        let selectedDate = new Date(popupData.selectedDate);

        // Update this so that it calculates the historical dates based on the LANDSAT cycle
        while (selectedDate <= startDate) {
            dates.push(selectedDate.toDateString());
            selectedDate.setDate(selectedDate.getDate() + 16);  // LANDSAT cycle
        }
        setHistoricalDates(dates);
    };

    // Function to get future overpass data from the Flask backend
    const getFutureOverpassData = async () => {
        try {
            const response = await axios.post('http://localhost:5001/overpass', {
                latitude: parseFloat(popupData.latitude),
                longitude: parseFloat(popupData.longitude),
            });
            setFutureOverpassData(response.data);
            console.log("Future Overpass Data:", response.data);
        } catch (error) {
            console.error("Error getting future overpass data:", error);
        }
    };

    // Function to get historical overpass data and metadata from the Flask backend
    const getHistoricalOverpassData = async () => {
        try {
            const response = await axios.post('http://localhost:5001/historical_overpass', {
                latitude: parseFloat(popupData.latitude),
                longitude: parseFloat(popupData.longitude),
                start_date: popupData.selectedDate,
                end_date: new Date().toISOString().split('T')[0], // Today’s date
            });
            setHistoricalOverpassData(response.data);
            console.log("Historical Overpass Data:", response.data);
        } catch (error) {
            console.error("Error getting historical overpass data:", error);
        }
    };

    // Function to get EVI data from the Flask backend
    const getEviData = async () => {
        try {
            const response = await axios.post('http://localhost:5001/evi', {
                latitude: parseFloat(popupData.latitude),
                longitude: parseFloat(popupData.longitude),
            });
            setEviData(response.data);
            console.log("EVI Data:", response.data);
            // Set the overlay URL to display on the map
            if (response.data.evi_composite_jpg) {
                setEviOverlayUrl(`http://localhost:5001${response.data.evi_composite_jpg}`);
            }
        } catch (error) {
            console.error("Error getting EVI data:", error);
        }
    };

    return isLoaded ? (
        <div className="map-container">
            {/* Latitude and Longitude Input Section */}
            <div className="coordinates-input">
                <input
                    type="text"
                    name="latitude"
                    placeholder="Latitude"
                    value={popupData.latitude}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="longitude"
                    placeholder="Longitude"
                    value={popupData.longitude}
                    onChange={handleInputChange}
                />
                <button className="latlong-submit-btn" onClick={handleLatLongSubmit}>Add Notification</button>
                <button className="reset-btn" onClick={handleReset}>Reset</button>
            </div>

            {/* New Buttons for Flask API Calls */}
            <div className="coordinates-input">
                <button className="other-btn" onClick={getFutureOverpassData}>Get Future Overpass</button>
                <button className="other-btn" onClick={getHistoricalOverpassData}>Get Historical Overpass</button>
                <button className="other-btn" onClick={getEviData}>Get EVI Data</button>
            </div>

            {/* Future Overpass Table */}
            {futureOverpassData && (
                <div className="future-overpass-table">
                    <h4 className="section-heading">Future Overpasses</h4>
                    <div className="table-scroll">
                        <table className="soft-bordered-table">
                            <thead>
                                <tr>
                                    <th>LandSat 8</th>
                                    <th>LandSat 9</th>
                                </tr>
                            </thead>
                            <tbody>
                                {futureOverpassData.landsat_8_overpasses.map((time, index) => (
                                    <tr key={index}>
                                        <td>{time}</td>
                                        <td>{futureOverpassData.landsat_9_overpasses[index] || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Historical Overpass Table */}
            {historicalOverpassData && (
                <div className="historical-overpass-table">
                    <h4 className="section-heading">Historical Overpasses</h4>
                    <div className="table-scroll">
                        <table className="soft-bordered-table">
                            <thead>
                                <tr>
                                    <th>LandSat 8</th>
                                    <th>LandSat 9</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historicalOverpassData.landsat_8_overpasses.slice(0, 10).map((time, index) => (
                                    <tr key={index}>
                                        <td>{time}</td>
                                        <td>{historicalOverpassData.landsat_9_overpasses[index] || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Metadata Table */}
            {historicalOverpassData && historicalOverpassData.metadata && (
                <div className="metadata-table">
                    <h4 className="section-heading"></h4>
                    <div className="table-scroll">
                        <table className="soft-bordered-table">
                            <thead>
                                <tr>
                                    <th>Metadata Filtered by Cloud Coverage of 0.10</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historicalOverpassData.metadata.slice(0, 10).map((meta, index) => (
                                    <tr key={index}>
                                        <td>{JSON.stringify(meta)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="map-wrapper">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={13}
                    onClick={onMapClick}
                    onLoad={setMap}
                >
                    {marker && <Marker position={marker} />}
                    {eviOverlayUrl && (
                        <GroundOverlay
                            url={eviOverlayUrl}
                            bounds={{
                                north: parseFloat(popupData.latitude) + 0.02,
                                south: parseFloat(popupData.latitude) - 0.02,
                                east: parseFloat(popupData.longitude) + 0.02,
                                west: parseFloat(popupData.longitude) - 0.02,
                            }}
                            opacity={0.7} // Set the overlay to 90% transparent
                        />
                    )}
                </GoogleMap>
            </div>

            {/* Popup Overlay */}
            {showPopup && <div className="popup-overlay"></div>}

            {/* Popup for Notification Settings */}
            {showPopup && (
                <div className="popup">
                    <button className="popup-close-btn" onClick={() => setShowPopup(false)}>X</button>
                    
                    <h3 className="popup-heading">Customize Notifications</h3>

                    {/* Display selected Lat/Lng */}
                    <label>Latitude</label>
                    <input type="text" name="latitude" value={popupData.latitude} onChange={handleInputChange} />

                    <label>Longitude</label>
                    <input type="text" name="longitude" value={popupData.longitude} onChange={handleInputChange} />

                    {/* Notification Time (Similar to Google Calendar) */}
                    <label>Notification Time</label>
                    <div className="notification-time-container">
                        <input
                            type="number"
                            name="advanceNoticeNumber"
                            value={popupData.advanceNoticeNumber}
                            onChange={handleInputChange}
                            className="notification-time-input"
                        />
                        <select
                            name="advanceNoticeUnit"
                            value={popupData.advanceNoticeUnit}
                            onChange={handleInputChange}
                        >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                        </select>
                    </div>

                    <label>Phone Type</label>
                    <select name="phoneType" value={popupData.phoneType} onChange={handleInputChange}>
                        <option value="Cell Phone">Cell Phone</option>
                        <option value="SAT Phone">SAT Phone</option>
                    </select>

                    <label>Phone Number (For Notifications via SMS)</label>
                    <input type="text" name="phoneNumber" value={popupData.phoneNumber} onChange={handleInputChange} />
                    
                    <label>Provider</label>
                    <select name="provider" value={popupData.provider} onChange={handleInputChange}>
                        <option value="Verizon">Verizon</option>
                        <option value="AT&T">AT&T</option>
                    </select>

                    <label>Show Historical Data?</label>
                    <input
                        type="checkbox"
                        name="showHistory"
                        checked={popupData.showHistory}
                        onChange={() => setPopupData({ ...popupData, showHistory: !popupData.showHistory })}
                    />

                    {popupData.showHistory && (
                        <div>
                            <label>Select Date for Historical Data</label>
                            <input type="date" name="selectedDate" onChange={handleInputChange} />
                        </div>
                    )}
                    <br></br>
                    <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                </div>
            )}
        </div>
    ) : <></>;
}