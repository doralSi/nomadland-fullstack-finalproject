import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { polygonToLeafletFormat } from '../../utils/isInsidePolygon';

// Component to handle map bounds based on region
export const MapBounds = ({ region }) => {
  const map = useMap();

  useEffect(() => {
    if (region && region.polygon && region.polygon.length > 0) {
      const bounds = polygonToLeafletFormat(region.polygon);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [region, map]);

  return null;
};

// Component to handle map clicks for adding points
export const MapClickHandler = ({ isAddingPoint, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingPoint) {
        onMapClick(e.latlng);
      }
    }
  });

  return null;
};

// Component to capture map instance
export const MapInstanceCapture = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
};

// Component to control map view
export const MapViewController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};
