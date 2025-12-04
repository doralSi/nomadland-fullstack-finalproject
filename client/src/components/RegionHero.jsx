import React from 'react';
import './RegionHero.css';

const RegionHero = ({ name, subtitle, imageUrl, about, onBackClick }) => {
  return (
    <div className="region-hero">
      {imageUrl ? (
        <>
          <img src={imageUrl} alt={name} className="region-hero-image" />
          <div className="region-hero-overlay"></div>
        </>
      ) : (
        <div className="region-hero-gradient"></div>
      )}
      
      <button onClick={onBackClick} className="back-to-regions-btn">
        <span className="material-symbols-outlined">arrow_back</span>
        All Regions
      </button>
      
      <div className="region-hero-content">
        <h1>{name}</h1>
        {subtitle && <h2 className="region-hero-subtitle">{subtitle}</h2>}
      </div>
    </div>
  );
};

export default RegionHero;
