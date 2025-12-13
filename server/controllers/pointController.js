import Point from '../models/Point.js';
import User from '../models/User.js';

// Create a new point
export const createPoint = async (req, res) => {
  try {
    const { title, description, category, lat, lng, images, language, isPrivate } = req.body;

    // Validate required fields
    if (!title || lat === undefined || lng === undefined) {
      return res.status(400).json({ 
        message: 'Title, latitude, and longitude are required' 
      });
    }

    const point = new Point({
      title,
      description,
      category,
      lat,
      lng,
      images: images || [],
      language: language || 'he',
      isPrivate: isPrivate || false,
      createdBy: req.user.id
    });

    await point.save();
    await point.populate('createdBy', 'username email');

    res.status(201).json(point);
  } catch (error) {
    console.error('Create point error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all points
export const getPoints = async (req, res) => {
  try {
    const { languages } = req.query;
    
    // Build filter query
    let filter = {};
    
    // Only show public points, or private points created by the current user
    if (req.user) {
      filter.$or = [
        { isPrivate: { $ne: true } },
        { isPrivate: true, createdBy: req.user.id }
      ];
    } else {
      filter.$or = [
        { isPrivate: { $exists: false } },
        { isPrivate: false }
      ];
    }
    
    // Language filtering
    // Map Rangers and Admins see all languages (handled by client)
    // Regular users: Hebrew mode shows he+en, English mode shows en only
    if (languages) {
      const langArray = languages.split(',').map(l => l.trim());
      if (langArray.length === 1) {
        filter.language = langArray[0];
      } else if (langArray.length > 1) {
        filter.language = { $in: langArray };
      }
    }
    
    const points = await Point.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(points);
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single point by ID
export const getPointById = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    res.json(point);
  } catch (error) {
    console.error('Get point by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a point
export const updatePoint = async (req, res) => {
  try {
    const { title, description, category, lat, lng, images } = req.body;

    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    // Update fields
    if (title !== undefined) point.title = title;
    if (description !== undefined) point.description = description;
    if (category !== undefined) point.category = category;
    if (lat !== undefined) point.lat = lat;
    if (lng !== undefined) point.lng = lng;
    if (images !== undefined) point.images = images;

    await point.save();
    await point.populate('createdBy', 'username email');

    res.json(point);
  } catch (error) {
    console.error('Update point error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a point
export const deletePoint = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    await point.deleteOne();

    res.json({ message: 'Point deleted successfully' });
  } catch (error) {
    console.error('Delete point error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add point to favorites
export const addToFavorites = async (req, res) => {
  try {
    const pointId = req.params.id;
    const userId = req.user.id;

    // Check if point exists
    const point = await Point.findById(pointId);
    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    // Find user and add to favorites if not already there
    const user = await User.findById(userId);
    if (!user.favoritePoints.includes(pointId)) {
      user.favoritePoints.push(pointId);
      await user.save();
    }

    res.json({ message: 'Point added to favorites', favoritePoints: user.favoritePoints });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove point from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const pointId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.favoritePoints = user.favoritePoints.filter(
      id => id.toString() !== pointId
    );
    await user.save();

    res.json({ message: 'Point removed from favorites', favoritePoints: user.favoritePoints });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's favorite points
export const getFavoritePoints = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'favoritePoints',
      populate: { path: 'createdBy', select: 'username email' }
    });

    res.json(user.favoritePoints || []);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
