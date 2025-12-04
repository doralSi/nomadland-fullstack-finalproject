import React, { useState } from 'react';
import { CATEGORIES } from '../constants/categories';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategories, onToggleCategory }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleCategoryClick = (categoryKey) => {
    onToggleCategory(categoryKey);
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === CATEGORIES.length) {
      // If all selected, deselect all
      onToggleCategory('CLEAR_ALL');
    } else {
      // Otherwise, select all
      onToggleCategory('SELECT_ALL');
    }
  };

  const allSelected = selectedCategories.length === CATEGORIES.length;

  return (
    <div className="category-filter">
      <div className="filter-header">
        <h3>Filter by Category</h3>
        <div className="filter-actions">
          <button 
            className={`select-all-btn ${allSelected ? 'all-selected' : ''}`}
            onClick={handleSelectAll}
          >
            {allSelected ? 'Clear All' : 'Select All'}
          </button>
          <button 
            className="mobile-toggle-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? '▲ Hide' : '▼ Show'}
          </button>
        </div>
      </div>
      
      <div className={`category-buttons ${isMobileOpen ? 'mobile-open' : ''}`}>
        {CATEGORIES.map((category) => {
          const isActive = selectedCategories.includes(category.key);
          
          return (
            <button
              key={category.key}
              className={`category-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.key)}
              data-tooltip={category.label}
            >
              <span className="material-symbols-outlined category-icon">
                {category.materialIcon}
              </span>
              <span className="category-label">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
