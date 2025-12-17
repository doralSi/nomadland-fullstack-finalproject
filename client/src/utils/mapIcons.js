import L from 'leaflet';
import { CATEGORIES } from '../constants/categories';

// Helper function to get category icon
export const getCategoryIcon = (categoryKey) => {
  const item = CATEGORIES.find(c => c.key === categoryKey);
  return item ? item.materialIcon : 'location_on';
};

// Helper function to get category label
export const getCategoryLabel = (categoryKey) => {
  const item = CATEGORIES.find(c => c.key === categoryKey);
  return item ? item.label : categoryKey;
};

// Create custom DivIcon for points based on category
export const createPointIcon = (categoryKey, isSelected = false, additionalClasses = '') => {
  const iconName = getCategoryIcon(categoryKey);
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="map-marker category-${categoryKey} ${additionalClasses} ${isSelected ? 'selected-marker' : ''}">
        <span class="material-symbols-outlined">${iconName}</span>
      </div>
    `,
    iconSize: isSelected ? [48, 48] : [32, 32],
    iconAnchor: isSelected ? [24, 48] : [16, 32],
    popupAnchor: [0, -32]
  });
};

// Create custom DivIcon for personal map points with type styling
export const createPersonalPointIcon = (categoryKey, pointType, isSelected = false) => {
  const iconName = getCategoryIcon(categoryKey);
  const typeClass = pointType === 'private' ? 'private-point' : 
                    pointType === 'favorite' ? 'favorite-point' : 
                    pointType === 'reviewed' ? 'reviewed-point' : 'public-point';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="map-marker category-${categoryKey} ${typeClass} ${isSelected ? 'selected-marker' : ''}">
        <span class="material-symbols-outlined">${iconName}</span>
      </div>
    `,
    iconSize: isSelected ? [48, 48] : [32, 32],
    iconAnchor: isSelected ? [24, 48] : [16, 32],
    popupAnchor: [0, -32]
  });
};
