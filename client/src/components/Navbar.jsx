import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import RegionsDropdown from './RegionsDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          NomadLand
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          
          <li className="navbar-item">
            <RegionsDropdown />
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link to="/me/maps" className="navbar-link">My Maps</Link>
              </li>
              {(user?.role === 'mapRanger' || user?.role === 'admin') && (
                <li className="navbar-item">
                  <Link to="/map-ranger" className="navbar-link navbar-link-highlight">
                    🗺️ Map Ranger Panel
                  </Link>
                </li>
              )}
              <li className="navbar-item">
                <span className="navbar-user">Welcome, {user?.firstName || user?.name || user?.email}</span>
              </li>
              <li className="navbar-item">
                <button 
                  onClick={toggleLanguage} 
                  className="navbar-language-btn"
                  title={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
                >
                  🌐 <span className="language-label">{language === 'he' ? 'HE' : 'EN'}</span>
                </button>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-button">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
