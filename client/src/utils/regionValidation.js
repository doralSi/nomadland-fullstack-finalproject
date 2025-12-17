// Check if a point (lat, lng) is inside a region's polygon
export const isPointInRegion = (lat, lng, polygon) => {
  if (!polygon || polygon.length === 0) return true;

  const x = lng;
  const y = lat;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

// Get warning message if point is outside region
export const getLocationWarning = (lat, lng, region) => {
  if (!region || !lat || !lng) return '';
  
  if (!isPointInRegion(lat, lng, region.polygon)) {
    return `⚠️ אזהרה: מיקום זה נמצא מחוץ לגבולות אזור ${region.name}`;
  }
  
  return '';
};
