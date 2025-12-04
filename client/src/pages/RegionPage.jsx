import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import RegionHero from '../components/RegionHero';
import CategoryFilterBar from '../components/CategoryFilterBar';
import RegionMap from '../components/RegionMap';
import RegionEvents from '../components/RegionEvents';
import RegionPointsList from '../components/RegionPointsList';
import './RegionPage.css';

const RegionPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { selectRegionBySlug, currentRegion } = useRegion();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const loadRegion = async () => {
      try {
        setLoading(true);
        setError(null);
        await selectRegionBySlug(slug);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load region');
      } finally {
        setLoading(false);
      }
    };

    loadRegion();
  }, [slug, selectRegionBySlug]);

  const handleBackToGlobalMap = () => {
    navigate('/regions');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <div className="region-page-container">
        <div className="region-page-loading">Loading region...</div>
      </div>
    );
  }

  if (error || !currentRegion) {
    return (
      <div className="region-page-container">
        <div className="region-page-error">
          <h2>{error || 'Region not found'}</h2>
          <button onClick={handleBackToGlobalMap} className="back-btn">
            Back to Regions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="region-page-container">
      <RegionHero 
        name={currentRegion.name}
        subtitle="Digital Nomad Paradise"
        imageUrl={currentRegion.heroImageUrl}
        about={currentRegion.description}
        onBackClick={handleBackToGlobalMap}
      />

      <div className="region-about-section">
        <h2>About {currentRegion.name}</h2>
        <p>{currentRegion.description}</p>
      </div>

      <CategoryFilterBar 
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <RegionMap region={currentRegion} selectedCategory={selectedCategory} />

      <div className="region-tabs-section">
        <div className="region-tabs">
          <button 
            className={`region-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
            data-label="Events"
            aria-label="Events"
          >
            <span className="material-symbols-outlined">event</span>
          </button>
          <button 
            className={`region-tab ${activeTab === 'points' ? 'active' : ''}`}
            onClick={() => setActiveTab('points')}
            data-label="Points"
            aria-label="Points List"
          >
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>

        <div className="region-tab-content">
          {activeTab === 'events' && <RegionEvents region={currentRegion} />}
          {activeTab === 'points' && <RegionPointsList region={currentRegion} />}
        </div>
      </div>
    </div>
  );
};

export default RegionPage;
