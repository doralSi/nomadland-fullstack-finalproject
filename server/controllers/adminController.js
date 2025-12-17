import User from "../models/User.js";
import Point from "../models/Point.js";
import EventTemplate from "../models/EventTemplate.js";
import Review from "../models/Review.js";
import Region from "../models/Region.js";

// Helper function to check if a point is inside a polygon
const isPointInPolygon = (point, polygon) => {
  const [lng, lat] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

// Get dashboard statistics
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPoints = await Point.countDocuments();
    const totalEvents = await EventTemplate.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const mapRangers = await User.countDocuments({ role: "mapRanger" });
    const admins = await User.countDocuments({ role: "admin" });
    const pendingPoints = await Point.countDocuments({ status: "pending" });

    res.json({
      totalUsers,
      totalPoints,
      totalEvents,
      totalReviews,
      newUsers,
      mapRangers,
      admins,
      pendingPoints
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users with pagination and filters
export const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = "", 
      role = "", 
      status = "" 
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const pointsCount = await Point.countDocuments({ createdBy: user._id });
        const reviewsCount = await Review.countDocuments({ user: user._id });
        
        return {
          ...user.toObject(),
          pointsCount,
          reviewsCount
        };
      })
    );

    res.json({
      users: usersWithStats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all points with pagination and filters
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
    
    // Handle privacy filter (status parameter used for private/public)
    if (status === "private") {
      query.isPrivate = true;
    } else if (status === "public") {
      query.isPrivate = false;
    }

    // Filter by region using the region field (not coordinates)
    if (region) {
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

// Get all events with pagination and filters
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
      query.name = { $regex: search, $options: "i" };
    }
    
    if (region) {
      query.region = region;
    }
    
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const total = await EventTemplate.countDocuments(query);
    const events = await EventTemplate.find(query)
      .populate("createdBy", "name email")
      .populate("region", "name")
      .sort({ startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Freeze user
export const freezeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent freezing admins
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot freeze admin users" });
    }

    user.status = "frozen";
    await user.save();

    res.json({ message: "User frozen successfully", user });
  } catch (error) {
    console.error("Error freezing user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unfreeze user
export const unfreezeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "active";
    await user.save();

    res.json({ message: "User unfrozen successfully", user });
  } catch (error) {
    console.error("Error unfreezing user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admins
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle point privacy
export const togglePointPrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPrivate } = req.body;
    
    const point = await Point.findById(id);
    if (!point) {
      return res.status(404).json({ message: "Point not found" });
    }

    point.isPrivate = isPrivate;
    await point.save();

    res.json({ message: "Point privacy updated successfully", point });
  } catch (error) {
    console.error("Error toggling point privacy:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve point
export const approvePoint = async (req, res) => {
  try {
    const { id } = req.params;
    
    const point = await Point.findById(id);
    if (!point) {
      return res.status(404).json({ message: "Point not found" });
    }

    point.status = "approved";
    await point.save();

    res.json({ message: "Point approved successfully", point });
  } catch (error) {
    console.error("Error approving point:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject point
export const rejectPoint = async (req, res) => {
  try {
    const { id } = req.params;
    
    const point = await Point.findById(id);
    if (!point) {
      return res.status(404).json({ message: "Point not found" });
    }

    point.status = "rejected";
    await point.save();

    res.json({ message: "Point rejected successfully", point });
  } catch (error) {
    console.error("Error rejecting point:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete point
export const deletePoint = async (req, res) => {
  try {
    const { id } = req.params;
    
    const point = await Point.findById(id);
    if (!point) {
      return res.status(404).json({ message: "Point not found" });
    }

    await Point.findByIdAndDelete(id);

    res.json({ message: "Point deleted successfully" });
  } catch (error) {
    console.error("Error deleting point:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await EventTemplate.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await EventTemplate.findByIdAndDelete(id);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Promote user to Map Ranger
export const promoteToMapRanger = async (req, res) => {
  try {
    const { id } = req.params;
    const { regions = [] } = req.body; // Array of region slugs
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    user.role = "mapRanger";
    user.rangerRegions = regions;
    await user.save();

    res.json({ message: "User promoted to Map Ranger successfully", user });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Demote Map Ranger to user
export const demoteFromMapRanger = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot demote admin users" });
    }

    user.role = "user";
    await user.save();

    res.json({ message: "User demoted to regular user successfully", user });
  } catch (error) {
    console.error("Error demoting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
