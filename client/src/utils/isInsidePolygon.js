/**
 * Determines if a point is inside a polygon using ray casting algorithm
 * @param {number} lat - Latitude of the point
 * @param {number} lng - Longitude of the point
 * @param {Array<Array<number>>} polygon - Array of [lng, lat] coordinate pairs
 * @returns {boolean} True if point is inside the polygon
 */
export const isPointInsidePolygon = (lat, lng, polygon) => {
  if (!polygon || polygon.length < 3) {
    return false;
  }

  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = [polygon[i][0], polygon[i][1]]; // lng, lat
    const [xj, yj] = [polygon[j][0], polygon[j][1]]; // lng, lat
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
};

/**
 * Validates if a point is inside a region
 * @param {number} lat - Latitude of the point
 * @param {number} lng - Longitude of the point
 * @param {Object} region - Region object with polygon property
 * @returns {boolean} True if point is inside the region
 */
export const isPointInsideRegion = (lat, lng, region) => {
  if (!region || !region.polygon) {
    return false;
  }
  
  return isPointInsidePolygon(lat, lng, region.polygon);
};

/**
 * Converts polygon coordinates to Leaflet format [lat, lng]
 * @param {Array<Array<number>>} polygon - Array of [lng, lat] coordinate pairs
 * @returns {Array<Array<number>>} Array of [lat, lng] coordinate pairs for Leaflet
 */
export const polygonToLeafletFormat = (polygon) => {
  if (!polygon) return [];
  return polygon.map(([lng, lat]) => [lat, lng]);
};
