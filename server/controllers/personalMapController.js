import PersonalMap from '../models/PersonalMap.js';
import Point from '../models/Point.js';
import Region from '../models/Region.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import * as turf from '@turf/turf';

// @desc    Create a new personal map
// @route   POST /api/personal-maps
// @access  Private
export const createPersonalMap = async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const personalMap = new PersonalMap({
      userId: req.user._id,
      title,
      description: description || '',
      coverImage: coverImage || null,
      pointIds: []
    });

    await personalMap.save();

    res.status(201).json({
      message: 'Personal map created successfully',
      map: personalMap
    });
  } catch (error) {
    console.error('Error creating personal map:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all maps for the logged-in user
// @route   GET /api/personal-maps/my
// @access  Private
export const getMyMaps = async (req, res) => {
  try {
    const maps = await PersonalMap.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('pointIds', 'name description location coordinates imageUrl');

    res.status(200).json({
      count: maps.length,
      maps
    });
  } catch (error) {
    console.error('Error fetching personal maps:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a specific personal map by ID
// @route   GET /api/personal-maps/:id
// @access  Private (owner only)
export const getMapById = async (req, res) => {
  try {
    const { id } = req.params;

    const map = await PersonalMap.findById(id)
      .populate('pointIds', 'name description location coordinates imageUrl region category');

    if (!map) {
      return res.status(404).json({ message: 'Personal map not found' });
    }

    // Check if the user is the owner
    if (map.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view your own maps.' });
    }

    res.status(200).json({ map });
  } catch (error) {
    console.error('Error fetching personal map:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a personal map
// @route   PATCH /api/personal-maps/:id
// @access  Private (owner only)
export const updatePersonalMap = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, coverImage } = req.body;

    const map = await PersonalMap.findById(id);

    if (!map) {
      return res.status(404).json({ message: 'Personal map not found' });
    }

    // Check if the user is the owner
    if (map.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own maps.' });
    }

    // Update fields
    if (title !== undefined) map.title = title;
    if (description !== undefined) map.description = description;
    if (coverImage !== undefined) map.coverImage = coverImage;

    await map.save();

    res.status(200).json({
      message: 'Personal map updated successfully',
      map
    });
  } catch (error) {
    console.error('Error updating personal map:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a personal map
// @route   DELETE /api/personal-maps/:id
// @access  Private (owner only)
export const deletePersonalMap = async (req, res) => {
  try {
    const { id } = req.params;

    const map = await PersonalMap.findById(id);

    if (!map) {
      return res.status(404).json({ message: 'Personal map not found' });
    }

    // Check if the user is the owner
    if (map.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own maps.' });
    }

    await PersonalMap.findByIdAndDelete(id);

    res.status(200).json({ message: 'Personal map deleted successfully' });
  } catch (error) {
    console.error('Error deleting personal map:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a point to a personal map
// @route   PATCH /api/personal-maps/:mapId/add/:pointId
// @access  Private (owner only)
export const addPointToMap = async (req, res) => {
  try {
    const { mapId, pointId } = req.params;

    const map = await PersonalMap.findById(mapId);

    if (!map) {
      return res.status(404).json({ message: 'Personal map not found' });
    }

    // Check if the user is the owner
    if (map.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own maps.' });
    }

    // Check if point exists
    const point = await Point.findById(pointId);
    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    // Check if point is already in the map
    if (map.pointIds.includes(pointId)) {
      return res.status(400).json({ message: 'Point is already in this map' });
    }

    map.pointIds.push(pointId);
    await map.save();

    const updatedMap = await PersonalMap.findById(mapId)
      .populate('pointIds', 'name description location coordinates imageUrl region category');

    res.status(200).json({
      message: 'Point added to map successfully',
      map: updatedMap
    });
  } catch (error) {
    console.error('Error adding point to map:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove a point from a personal map
// @route   PATCH /api/personal-maps/:mapId/remove/:pointId
// @access  Private (owner only)
export const removePointFromMap = async (req, res) => {
  try {
    const { mapId, pointId } = req.params;

    const map = await PersonalMap.findById(mapId);

    if (!map) {
      return res.status(404).json({ message: 'Personal map not found' });
    }

    // Check if the user is the owner
    if (map.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own maps.' });
    }

    // Check if point is in the map
    if (!map.pointIds.includes(pointId)) {
      return res.status(400).json({ message: 'Point is not in this map' });
    }

    map.pointIds = map.pointIds.filter(id => id.toString() !== pointId);
    await map.save();

    const updatedMap = await PersonalMap.findById(mapId)
      .populate('pointIds', 'name description location coordinates imageUrl region category');

    res.status(200).json({
      message: 'Point removed from map successfully',
      map: updatedMap
    });
  } catch (error) {
    console.error('Error removing point from map:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get regions where user has created or favorited points
// @route   GET /api/personal-maps/regions
// @access  Private
export const getUserRegions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user's created points
    const createdPoints = await Point.find({ createdBy: userId });

    // Get user's favorite points
    const user = await User.findById(userId).populate('favoritePoints');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const favoritePoints = user.favoritePoints || [];

    // Get points where user has written reviews
    const userReviews = await Review.find({ userId }).select('pointId');
    const reviewedPointIds = userReviews.map(r => r.pointId);
    const reviewedPoints = await Point.find({ _id: { $in: reviewedPointIds } });

    // Combine all points (using Set to avoid duplicates)
    const pointsMap = new Map();
    [...createdPoints, ...favoritePoints, ...reviewedPoints].forEach(point => {
      pointsMap.set(point._id.toString(), point);
    });
    const allPoints = Array.from(pointsMap.values());

    if (allPoints.length === 0) {
      return res.status(200).json({ regions: [] });
    }

    // Get all regions
    const regions = await Region.find({ isActive: true });

    // Find which regions contain the user's points
    const regionsWithPoints = [];

    for (const region of regions) {
      // Create polygon from region coordinates
      const polygon = turf.polygon([region.polygon]);

      // Check if any point is in this region
      const pointsInRegion = allPoints.filter(point => {
        const pt = turf.point([point.lng, point.lat]);
        return turf.booleanPointInPolygon(pt, polygon);
      });

      if (pointsInRegion.length > 0) {
        // Count created vs favorite vs reviewed points
        const createdCount = pointsInRegion.filter(p => 
          p.createdBy.toString() === userId.toString()
        ).length;
        const favoriteCount = pointsInRegion.filter(p => 
          favoritePoints.some(fp => fp._id.toString() === p._id.toString())
        ).length;
        const reviewedCount = pointsInRegion.filter(p =>
          reviewedPointIds.some(rid => rid.toString() === p._id.toString())
        ).length;

        regionsWithPoints.push({
          _id: region._id,
          name: region.name,
          slug: region.slug,
          description: region.description,
          center: region.center,
          zoom: region.zoom,
          heroImageUrl: region.heroImageUrl,
          pointCount: pointsInRegion.length,
          createdCount,
          favoriteCount,
          reviewedCount
        });
      }
    }

    res.status(200).json({ regions: regionsWithPoints });
  } catch (error) {
    console.error('Error fetching user regions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's points in a specific region
// @route   GET /api/personal-maps/regions/:regionSlug
// @access  Private
export const getUserPointsInRegion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { regionSlug } = req.params;

    // Find the region
    const region = await Region.findOne({ slug: regionSlug, isActive: true });
    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Get all user's created points
    const createdPoints = await Point.find({ createdBy: userId })
      .populate('createdBy', 'name email')
      .populate('reviewCount');

    // Get user's favorite points
    const user = await User.findById(userId).populate({
      path: 'favoritePoints',
      populate: [
        { path: 'createdBy', select: 'name email' },
        { path: 'reviewCount' }
      ]
    });
    const favoritePoints = user.favoritePoints || [];

    // Get points where user has written reviews
    const userReviews = await Review.find({ userId })
      .populate({
        path: 'pointId',
        populate: [
          { path: 'createdBy', select: 'name email' },
          { path: 'reviewCount' }
        ]
      });
    
    // Create map of point reviews for easy lookup
    const reviewsByPoint = {};
    userReviews.forEach(review => {
      if (review.pointId) {
        reviewsByPoint[review.pointId._id.toString()] = review;
      }
    });

    const reviewedPoints = userReviews
      .filter(r => r.pointId)
      .map(r => r.pointId);

    // Filter points that are in this region
    const polygon = turf.polygon([region.polygon]);

    const createdInRegion = createdPoints.filter(point => {
      const pt = turf.point([point.lng, point.lat]);
      return turf.booleanPointInPolygon(pt, polygon);
    });

    const favoritesInRegion = favoritePoints.filter(point => {
      const pt = turf.point([point.lng, point.lat]);
      return turf.booleanPointInPolygon(pt, polygon);
    });

    const reviewedInRegion = reviewedPoints.filter(point => {
      const pt = turf.point([point.lng, point.lat]);
      return turf.booleanPointInPolygon(pt, polygon);
    }).map(point => ({
      ...point.toObject(),
      userReview: reviewsByPoint[point._id.toString()]
    }));

    res.status(200).json({
      region: {
        _id: region._id,
        name: region.name,
        slug: region.slug,
        center: region.center,
        zoom: region.zoom,
        polygon: region.polygon,
        heroImageUrl: region.heroImageUrl
      },
      createdPoints: createdInRegion,
      favoritePoints: favoritesInRegion,
      reviewedPoints: reviewedInRegion
    });
  } catch (error) {
    console.error('Error fetching user points in region:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
