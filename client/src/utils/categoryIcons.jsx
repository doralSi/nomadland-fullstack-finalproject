import { renderToString } from 'react-dom/server';
import HikingIcon from '@mui/icons-material/Hiking';
import OpacityIcon from '@mui/icons-material/Opacity';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import MuseumIcon from '@mui/icons-material/Museum';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PoolIcon from '@mui/icons-material/Pool';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ChurchIcon from '@mui/icons-material/Church';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Category to Material Icon mapping
const categoryIconMap = {
  // Official categories (as defined in constants/categories.js)
  trail: HikingIcon,
  spring: OpacityIcon,
  viewpoint: LandscapeIcon,
  beach: BeachAccessIcon,
  restaurant: RestaurantIcon,
  cafe: LocalCafeIcon,
  culture: MuseumIcon,
  market: StorefrontIcon,
  pool: PoolIcon,
  transit: DirectionsBusIcon,
  workspace: LaptopMacIcon,
  kids: ChildCareIcon,
  medical: LocalHospitalIcon,
  sports: SportsSoccerIcon,
  religion: ChurchIcon,
  
  // Legacy mappings (for backward compatibility - will be migrated)
  trails: HikingIcon,
  viewpoints: LandscapeIcon,
  beaches: BeachAccessIcon,
  restaurants: RestaurantIcon,
  cafes: LocalCafeIcon,
  markets: StorefrontIcon,
  coworking: LaptopMacIcon,
  activities: SportsSoccerIcon,
  nature: LandscapeIcon,
  other: LocationOnIcon,
  
  // Additional alternative mappings
  hiking: HikingIcon,
  water: OpacityIcon,
  lookout: LandscapeIcon,
  food: RestaurantIcon,
  coffee: LocalCafeIcon,
  shopping: StorefrontIcon,
  hospital: LocalHospitalIcon,
  laptop: LaptopMacIcon,
  baby: ChildCareIcon,
  sport: SportsSoccerIcon,
  
  // Default fallback
  default: LocationOnIcon
};

/**
 * Get SVG string representation of a Material Icon for a given category
 * @param {string} category - The category name
 * @returns {string} SVG string of the icon
 */
export const getCategoryIconSvg = (category) => {
  // Normalize category to lowercase for matching
  const normalizedCategory = category ? category.toLowerCase().trim() : 'default';
  
  // Get the icon component from the map, fallback to default
  const IconComponent = categoryIconMap[normalizedCategory] || categoryIconMap.default;
  
  // Render the icon to SVG string with white color and appropriate size
  return renderToString(
    <IconComponent style={{ fontSize: 24, color: 'white' }} />
  );
};

/**
 * Get all available categories
 * @returns {string[]} Array of category names
 */
export const getAvailableCategories = () => {
  return Object.keys(categoryIconMap).filter(key => key !== 'default');
};

/**
 * Check if a category has a specific icon
 * @param {string} category - The category name
 * @returns {boolean} True if category has a specific icon
 */
export const hasCustomIcon = (category) => {
  const normalizedCategory = category ? category.toLowerCase().trim() : '';
  return normalizedCategory in categoryIconMap && normalizedCategory !== 'default';
};
