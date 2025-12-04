import React from 'react';
import { CATEGORIES } from '../constants/categories';
import './CategoryFilterBar.css';

const CategoryFilterBar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="category-filter-bar">
      <div className="category-filter-bar-content">
        <button
          className={`category-filter-chip ${!selectedCategory ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <span className="material-symbols-outlined">grid_view</span>
          All
        </button>
        
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            className={`category-filter-chip ${selectedCategory === category.key ? 'active' : ''}`}
            onClick={() => onSelectCategory(category.key)}
          >
            <span className="material-symbols-outlined">{category.materialIcon}</span>
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilterBar;
