/**
 * Determines if a point is inside a polygon using ray casting algorithm
 * @param {Object} point - Object with lat and lng properties
 * @param {Array<Array<number>>} polygon - Array of [lng, lat] coordinate pairs
 * @returns {boolean} True if point is inside the polygon
 */
export const isInsidePolygon = (point, polygon) => {
  if (!polygon || polygon.length < 3) {
    return false;
  }

  const { lat, lng } = point;
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
