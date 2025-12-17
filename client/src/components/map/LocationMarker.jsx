import { Marker, useMapEvents } from 'react-leaflet';

// Component to handle map clicks and place/move marker
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

export default LocationMarker;
