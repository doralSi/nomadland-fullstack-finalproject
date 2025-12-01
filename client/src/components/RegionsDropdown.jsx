import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import './RegionsDropdown.css';

const RegionsDropdown = () => {
  const { regions, loading } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRegionClick = (slug) => {
    navigate(`/region/${slug}`);
    setIsOpen(false);
  };

  return (
    <div className="regions-dropdown" ref={dropdownRef}>
      <button 
        className="regions-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Regions {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className="regions-dropdown-menu">
          {loading ? (
            <div className="regions-dropdown-loading">Loading...</div>
          ) : regions.length > 0 ? (
            <ul className="regions-dropdown-list">
              {regions.map((region) => (
                <li key={region._id}>
                  <button
                    className="regions-dropdown-item"
                    onClick={() => handleRegionClick(region.slug)}
                  >
                    {region.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="regions-dropdown-empty">No regions available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegionsDropdown;
