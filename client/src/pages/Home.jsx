import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Welcome to NomadLand</h1>
        <p className="home-subtitle">
          Discover and share amazing travel destinations around the world
        </p>
        
        {!isAuthenticated ? (
          <div className="home-cta">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        ) : (
          <div className="home-cta">
            <Link to="/points" className="btn btn-primary">
              Explore Points
            </Link>
            <Link to="/create-point" className="btn btn-secondary">
              Create New Point
            </Link>
          </div>
        )}
      </div>

      <div className="home-features">
        <div className="feature-card">
          <h3>📍 Discover Places</h3>
          <p>Explore unique travel destinations shared by the community</p>
        </div>
        <div className="feature-card">
          <h3>🗺️ Interactive Maps</h3>
          <p>View locations on interactive maps with detailed information</p>
        </div>
        <div className="feature-card">
          <h3>📸 Share Experiences</h3>
          <p>Upload photos and share your travel stories</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
