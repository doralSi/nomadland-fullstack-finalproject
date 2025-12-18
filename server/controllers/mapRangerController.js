import Point from '../models/Point.js';
import EventTemplate from '../models/EventTemplate.js';
import User from '../models/User.js';

// ==================== POINTS MODERATION ====================

// Get all pending points
export const getPendingPoints = async (req, res) => {
  try {
    const points = await Point.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(points);
  } catch (error) {
    console.error('Get pending points error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a point
export const approvePoint = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    point.status = 'approved';
    await point.save();
    await point.populate('createdBy', 'name email');

    res.json({ message: 'Point approved successfully', point });
  } catch (error) {
    console.error('Approve point error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a point
export const rejectPoint = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    point.status = 'rejected';
    await point.save();
    await point.populate('createdBy', 'name email');

    res.json({ message: 'Point rejected successfully', point });
  } catch (error) {
    console.error('Reject point error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a point
export const deletePointByMapRanger = async (req, res) => {
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

// Update point location
export const updatePointLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ message: 'Point not found' });
    }

    point.lat = lat;
    point.lng = lng;

    await point.save();
    await point.populate('createdBy', 'name email');

    res.json({ message: 'Point location updated successfully', point });
  } catch (error) {
    console.error('Update point location error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Point not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== EVENTS MODERATION ====================

// Get all pending events
export const getPendingEvents = async (req, res) => {
  try {
    const events = await EventTemplate.find({ status: 'underReview' })
      .populate('createdBy', 'name email')
      .populate('region', 'name')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve an event
export const approveEvent = async (req, res) => {
  try {
    const event = await EventTemplate.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'approved';
    await event.save();
    await event.populate('createdBy', 'name email');
    await event.populate('region', 'name');

    res.json({ message: 'Event approved successfully', event });
  } catch (error) {
    console.error('Approve event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject an event
export const rejectEvent = async (req, res) => {
  try {
    const event = await EventTemplate.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'rejected';
    await event.save();
    await event.populate('createdBy', 'name email');
    await event.populate('region', 'name');

    res.json({ message: 'Event rejected successfully', event });
  } catch (error) {
    console.error('Reject event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an event
export const deleteEventByMapRanger = async (req, res) => {
  try {
    const event = await EventTemplate.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== USER MANAGEMENT (Admin Only) ====================

// Get all users
export const getUsers = async (req, res) => {
  try {
    // This route should be protected by both mapRanger auth and additional admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Promote user to mapRanger
export const promoteToMapRanger = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin role' });
    }

    user.role = 'mapRanger';
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({ message: 'User promoted to Map Ranger successfully', user: userResponse });
  } catch (error) {
    console.error('Promote user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Demote user to regular user
export const demoteToUser = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin role' });
    }

    user.role = 'user';
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({ message: 'User demoted to regular user successfully', user: userResponse });
  } catch (error) {
    console.error('Demote user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get stats for a specific region (Map Ranger)
export const getRegionStats = async (req, res) => {
  try {
    const { regionSlug } = req.params;
    
    // Get region ID from slug
    const Region = (await import('../models/Region.js')).default;
    const region = await Region.findOne({ slug: regionSlug });
    
    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Count points in region - if admin, count all points including private ones
    const pointsQuery = { 
      region: region._id,
      status: 'approved'
    };
    if (req.user.role !== 'admin') {
      pointsQuery.isPrivate = false;
    }
    const pointsCount = await Point.countDocuments(pointsQuery);

    // Count events in region
    const eventsCount = await EventTemplate.countDocuments({ 
      region: region._id 
    });

    // Count reviews in region (reviews on points in this region)
    const Review = (await import('../models/Review.js')).default;
    const pointsInRegion = await Point.find({ 
      region: region._id,
      status: 'approved'
    }).select('_id');
    const pointIds = pointsInRegion.map(p => p._id);
    const reviewsCount = await Review.countDocuments({ 
      point: { $in: pointIds } 
    });

    // Count rangers for this region
    const rangersCount = await User.countDocuments({ 
      role: 'mapRanger',
      rangerRegions: regionSlug 
    });

    res.json({
      pointsCount,
      eventsCount,
      reviewsCount,
      rangersCount
    });
  } catch (error) {
    console.error('Get region stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GET POINTS AND EVENTS ====================

// Get all points (with filtering) - for Map Rangers
export const getPoints = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = "", 
      region = "",
      category = "",
      status = ""
    } = req.query;

    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    
    if (category) {
      query.category = category;
    }
    
    // Handle privacy filter
    if (status === "private") {
      query.isPrivate = true;
    } else if (status === "public") {
      query.isPrivate = false;
    }

    // Filter by region - convert slug to ObjectId
    if (region) {
      const Region = (await import('../models/Region.js')).default;
      const regionDoc = await Region.findOne({ slug: region });
      if (regionDoc) {
        query.region = regionDoc._id;
      }
    }

    const total = await Point.countDocuments(query);
    const points = await Point.find(query)
      .populate("createdBy", "name email")
      .populate("region", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add region name and slug from populated field
    const enrichedPoints = points.map(point => ({
      ...point,
      regionName: point.region?.name || "Unknown",
      regionSlug: point.region?.slug || null
    }));

    res.json({
      points: enrichedPoints,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error getting points:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all events (with filtering) - for Map Rangers
export const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      region = "",
      startDate = "",
      endDate = ""
    } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (region) {
      query.region = region;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }

    const total = await EventTemplate.countDocuments(query);
    const events = await EventTemplate.find(query)
      .populate("createdBy", "name email")
      .populate("region", "name slug")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const enrichedEvents = events.map(event => ({
      ...event,
      regionName: event.region?.name || "Unknown",
      regionSlug: event.region?.slug || null
    }));

    res.json({
      events: enrichedEvents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({ message: "Server error" });
  }
};
