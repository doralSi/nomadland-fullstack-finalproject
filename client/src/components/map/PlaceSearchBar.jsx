import React, { useState } from 'react';
import L from 'leaflet';
import './PlaceSearchBar.css';

const PlaceSearchBar = ({ 
  mapInstance, 
  filteredPoints, 
  region, 
  onLocationSelect, 
  onPointSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];

    // Search in existing points
    const matchingPoints = filteredPoints.filter(point =>
      point.title.toLowerCase().includes(query.toLowerCase()) ||
      point.description?.toLowerCase().includes(query.toLowerCase())
    );

    results.push(...matchingPoints.map(point => ({
      type: 'point',
      name: point.title,
      lat: point.lat,
      lng: point.lng,
      point: point
    })));

    // Search using Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const geoResults = await response.json();
      
      results.push(...geoResults.map(result => ({
        type: 'location',
        name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      })));
    } catch (err) {
      console.error('Search error:', err);
    }

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSelectSearchResult = (result) => {
    if (!mapInstance) return;

    // Remove previous search marker
    if (searchMarker && mapInstance.hasLayer(searchMarker)) {
      mapInstance.removeLayer(searchMarker);
    }

    if (result.type === 'point') {
      mapInstance.flyTo([result.lat, result.lng], 16, { duration: 1.5 });
      if (onPointSelect) {
        onPointSelect(result.point);
      }
    } else {
      mapInstance.flyTo([result.lat, result.lng], 15, { duration: 1.5 });

      const marker = L.marker([result.lat, result.lng], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }).addTo(mapInstance);

      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>${result.name}</strong><br/>
          <button onclick="window.dispatchEvent(new CustomEvent('addPointAtLocation', { detail: { lat: ${result.lat}, lng: ${result.lng} } }))" 
                  style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Add Point Here
          </button>
        </div>
      `).openPopup();

      setSearchMarker(marker);
      
      if (onLocationSelect) {
        onLocationSelect(result.lat, result.lng);
      }
    }

    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div className="map-search-container">
      <div className="map-search-input-wrapper">
        <input
          type="text"
          placeholder="Search for places..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="map-search-input"
        />
        {showSearchResults && searchResults.length > 0 && (
          <div className="map-search-results">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="map-search-result-item"
                onClick={() => handleSelectSearchResult(result)}
              >
                <span className="material-symbols-outlined">
                  {result.type === 'point' ? 'place' : 'location_on'}
                </span>
                <span>{result.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceSearchBar;
