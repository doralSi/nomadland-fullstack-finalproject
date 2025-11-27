import EventTemplate from '../models/EventTemplate.js';

// Middleware to check if user is owner or admin for events
const allowEventOwnerOrAdmin = async (req, res, next) => {
  try {
    const eventTemplate = await EventTemplate.findById(req.params.id);

    if (!eventTemplate) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the owner or an admin
    if (eventTemplate.createdBy.toString() === req.user.id || req.user.role === 'admin') {
      req.eventTemplate = eventTemplate; // Optionally attach the event to the request
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. You must be the owner or an admin.' 
    });
  } catch (error) {
    console.error('allowEventOwnerOrAdmin middleware error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default allowEventOwnerOrAdmin;
