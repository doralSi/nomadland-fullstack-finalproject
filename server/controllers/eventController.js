import EventTemplate from '../models/EventTemplate.js';
import Region from '../models/Region.js';

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point, polygon) {
  const { lat, lng } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]; // lng
    const yi = polygon[i][1]; // lat
    const xj = polygon[j][0]; // lng
    const yj = polygon[j][1]; // lat

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

// Helper function to generate event instances based on repeat rules
function generateEventInstances(template, fromDate, toDate) {
  const instances = [];
  const start = new Date(Math.max(new Date(template.startDate), new Date(fromDate)));
  const end = new Date(Math.min(new Date(template.endDate), new Date(toDate)));

  if (start > end) return instances;

  if (template.repeat === 'none') {
    // Single or multi-day event
    const templateStart = new Date(template.startDate);
    const templateEnd = new Date(template.endDate);
    
    // Check if it's a multi-day event
    if (templateStart.toDateString() !== templateEnd.toDateString()) {
      // Multi-day event - create an instance for each day
      let currentDate = new Date(Math.max(templateStart, start));
      const lastDay = new Date(Math.min(templateEnd, end));
      
      while (currentDate <= lastDay) {
        instances.push({
          templateId: template._id,
          date: new Date(currentDate),
          title: template.title,
          description: template.description,
          imageUrl: template.imageUrl,
          cost: template.cost,
          time: template.time,
          duration: template.duration,
          isAllDay: true, // Multi-day events are treated as all-day
          location: template.location,
          region: template.region,
          language: template.language,
          createdBy: template.createdBy,
          status: template.status,
          rsvps: template.rsvps || []
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // Single-day event
      if (templateStart >= start && templateStart <= end) {
        instances.push({
          templateId: template._id,
          date: templateStart,
          title: template.title,
          description: template.description,
          imageUrl: template.imageUrl,
          cost: template.cost,
          time: template.time,
          duration: template.duration,
          isAllDay: template.isAllDay,
          location: template.location,
          region: template.region,
          language: template.language,
          createdBy: template.createdBy,
          status: template.status,
          rsvps: template.rsvps || []
        });
      }
    }
  } else if (template.repeat === 'daily') {
    // Daily repetition
    let currentDate = new Date(start);
    while (currentDate <= end) {
      instances.push({
        templateId: template._id,
        date: new Date(currentDate),
        title: template.title,
        description: template.description,
        imageUrl: template.imageUrl,
        cost: template.cost,
        time: template.time,
        duration: template.duration,
        isAllDay: template.isAllDay,
        location: template.location,
        region: template.region,
        language: template.language,
        createdBy: template.createdBy,
        status: template.status,
        rsvps: template.rsvps || []
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (template.repeat === 'weekly') {
    // Weekly repetition on specific days
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (template.repeatDays && template.repeatDays.includes(dayOfWeek)) {
        instances.push({
          templateId: template._id,
          date: new Date(currentDate),
          title: template.title,
          description: template.description,
          imageUrl: template.imageUrl,
          cost: template.cost,
          time: template.time,
          duration: template.duration,
          isAllDay: template.isAllDay,
          location: template.location,
          region: template.region,
          language: template.language,
          createdBy: template.createdBy,
          status: template.status,
          rsvps: template.rsvps || []
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (template.repeat === 'monthly') {
    // Monthly repetition (same day of month)
    const startDay = new Date(template.startDate).getDate();
    let currentDate = new Date(start);
    currentDate.setDate(startDay);
    
    while (currentDate <= end) {
      if (currentDate >= start) {
        instances.push({
          templateId: template._id,
          date: new Date(currentDate),
          title: template.title,
          description: template.description,
          imageUrl: template.imageUrl,
          cost: template.cost,
          time: template.time,
          duration: template.duration,
          isAllDay: template.isAllDay,
          location: template.location,
          region: template.region,
          language: template.language,
          createdBy: template.createdBy,
          status: template.status,
          rsvps: template.rsvps || []
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(startDay);
    }
  }

  // Apply overrides
  if (template.overrides && template.overrides.length > 0) {
    template.overrides.forEach(override => {
      const overrideDate = new Date(override.date);
      const instanceIndex = instances.findIndex(inst => {
        const instDate = new Date(inst.date);
        return instDate.toDateString() === overrideDate.toDateString();
      });

      if (instanceIndex !== -1) {
        if (override.cancelled) {
          // Remove cancelled instance
          instances.splice(instanceIndex, 1);
        } else {
          // Apply override values
          if (override.title) instances[instanceIndex].title = override.title;
          if (override.description) instances[instanceIndex].description = override.description;
          if (override.cost) instances[instanceIndex].cost = override.cost;
          if (override.time) instances[instanceIndex].time = override.time;
          if (override.location) instances[instanceIndex].location = override.location;
        }
      }
    });
  }

  return instances;
}

// Create event template
export const createEventTemplate = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      cost,
      region,
      language,
      repeat,
      repeatDays,
      startDate,
      endDate,
      time,
      duration,
      isAllDay,
      location
    } = req.body;

    // Validate required fields
    if (!title || !description || !region || !startDate || !endDate || !location) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    // Validate location coordinates
    if (!location.lat || !location.lng) {
      return res.status(400).json({
        message: 'Location must include lat and lng coordinates'
      });
    }

    // Validate date range
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: 'endDate must be after startDate'
      });
    }

    // Validate weekly repeat days
    if (repeat === 'weekly' && (!repeatDays || repeatDays.length === 0)) {
      return res.status(400).json({
        message: 'repeatDays is required for weekly events'
      });
    }

    // Get region and validate event location is inside region polygon
    const regionDoc = await Region.findById(region);
    if (!regionDoc) {
      return res.status(404).json({ message: 'Region not found' });
    }

    if (!isPointInPolygon(location, regionDoc.polygon)) {
      return res.status(400).json({
        message: 'Event location must be inside the region boundaries'
      });
    }

    const eventTemplate = new EventTemplate({
      title,
      description,
      imageUrl,
      cost,
      region,
      language: language || 'he',
      repeat: repeat || 'none',
      repeatDays: repeat === 'weekly' ? repeatDays : undefined,
      startDate,
      endDate,
      time: time || undefined,
      duration: duration || undefined,
      isAllDay: isAllDay || false,
      location,
      createdBy: req.user.id,
      status: 'approved'
    });

    await eventTemplate.save();
    await eventTemplate.populate('createdBy', 'username email');
    await eventTemplate.populate('region', 'name slug');

    res.status(201).json(eventTemplate);
  } catch (error) {
    console.error('Create event template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get events in range (with dynamic instance generation)
export const getEventsInRange = async (req, res) => {
  try {
    const { region, languages } = req.query;
    // Support both 'from/to' and 'startDate/endDate' parameters
    const from = req.query.from || req.query.startDate;
    const to = req.query.to || req.query.endDate;

    if (!from || !to) {
      return res.status(400).json({
        message: 'from/startDate and to/endDate dates are required'
      });
    }

    const query = { status: 'approved' };
    if (region) {
      query.region = region;
    }

    // Language filtering logic:
    // Map Rangers and Admins see all languages (handled by client)
    // Regular users: Hebrew mode shows he+en, English mode shows en only
    if (languages) {
      const langArray = languages.split(',').map(l => l.trim());
      if (langArray.length === 1) {
        query.language = langArray[0];
      } else if (langArray.length > 1) {
        query.language = { $in: langArray };
      }
    }

    // Find all templates that could have events in the range
    query.$or = [
      {
        // Templates that start before 'to' and end after 'from'
        startDate: { $lte: new Date(to) },
        endDate: { $gte: new Date(from) }
      }
    ];

    const templates = await EventTemplate.find(query)
      .populate('createdBy', 'username email')
      .populate('region', 'name slug');

    // Generate all instances
    let allInstances = [];
    templates.forEach(template => {
      const instances = generateEventInstances(template, from, to);
      allInstances = allInstances.concat(instances);
    });

    // Sort by date and time
    allInstances.sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      // Handle missing time values
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });

    res.json(allInstances);
  } catch (error) {
    console.error('Get events in range error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single event template by ID
export const getEventTemplateById = async (req, res) => {
  try {
    const eventTemplate = await EventTemplate.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('region', 'name slug')
      .populate('rsvps.user', 'username email');

    if (!eventTemplate) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(eventTemplate);
  } catch (error) {
    console.error('Get event template by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update event template
export const updateEventTemplate = async (req, res) => {
  try {
    const eventTemplate = await EventTemplate.findById(req.params.id);

    if (!eventTemplate) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const {
      title,
      description,
      imageUrl,
      cost,
      region,
      language,
      repeat,
      repeatDays,
      startDate,
      endDate,
      time,
      location,
      overrides
    } = req.body;

    // If location is being updated, validate it's inside region polygon
    if (location) {
      const regionId = region || eventTemplate.region;
      const regionDoc = await Region.findById(regionId);
      if (!regionDoc) {
        return res.status(404).json({ message: 'Region not found' });
      }

      if (!isPointInPolygon(location, regionDoc.polygon)) {
        return res.status(400).json({
          message: 'Event location must be inside the region boundaries'
        });
      }
    }

    // Update fields
    if (title !== undefined) eventTemplate.title = title;
    if (description !== undefined) eventTemplate.description = description;
    if (imageUrl !== undefined) eventTemplate.imageUrl = imageUrl;
    if (cost !== undefined) eventTemplate.cost = cost;
    if (region !== undefined) eventTemplate.region = region;
    if (language !== undefined) eventTemplate.language = language;
    if (repeat !== undefined) eventTemplate.repeat = repeat;
    if (repeatDays !== undefined) eventTemplate.repeatDays = repeatDays;
    if (startDate !== undefined) eventTemplate.startDate = startDate;
    if (endDate !== undefined) eventTemplate.endDate = endDate;
    if (time !== undefined) eventTemplate.time = time;
    if (location !== undefined) eventTemplate.location = location;
    if (overrides !== undefined) eventTemplate.overrides = overrides;

    await eventTemplate.save();
    await eventTemplate.populate('createdBy', 'username email');
    await eventTemplate.populate('region', 'name slug');

    res.json(eventTemplate);
  } catch (error) {
    console.error('Update event template error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete event template
export const deleteEventTemplate = async (req, res) => {
  try {
    const eventTemplate = await EventTemplate.findById(req.params.id);

    if (!eventTemplate) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await eventTemplate.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event template error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get events created by user
export const getMyEvents = async (req, res) => {
  try {
    const events = await EventTemplate.find({ createdBy: req.user.id })
      .populate('region', 'name slug')
      .sort({ startDate: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add RSVP to event
export const addRSVP = async (req, res) => {
  try {
    const eventTemplate = await EventTemplate.findById(req.params.id);

    if (!eventTemplate) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user already RSVP'd
    const existingRSVP = eventTemplate.rsvps.find(
      rsvp => rsvp.user.toString() === req.user.id
    );

    if (existingRSVP) {
      return res.status(400).json({ message: 'You already RSVP\'d to this event' });
    }

    // Add RSVP
    eventTemplate.rsvps.push({
      user: req.user.id,
      date: new Date()
    });

    await eventTemplate.save();
    await eventTemplate.populate('rsvps.user', 'username email');

    res.json({
      message: 'RSVP added successfully',
      rsvpCount: eventTemplate.rsvps.length,
      rsvps: eventTemplate.rsvps
    });
  } catch (error) {
    console.error('Add RSVP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove RSVP from event
export const removeRSVP = async (req, res) => {
  try {
    const eventTemplate = await EventTemplate.findById(req.params.id);

    if (!eventTemplate) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find and remove RSVP
    const rsvpIndex = eventTemplate.rsvps.findIndex(
      rsvp => rsvp.user.toString() === req.user.id
    );

    if (rsvpIndex === -1) {
      return res.status(400).json({ message: 'You have not RSVP\'d to this event' });
    }

    eventTemplate.rsvps.splice(rsvpIndex, 1);

    await eventTemplate.save();

    res.json({
      message: 'RSVP removed successfully',
      rsvpCount: eventTemplate.rsvps.length
    });
  } catch (error) {
    console.error('Remove RSVP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get RSVPs for an event
export const getEventRSVPs = async (req, res) => {
  try {
    const eventTemplate = await EventTemplate.findById(req.params.id)
      .populate('rsvps.user', 'username email');

    if (!eventTemplate) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      rsvpCount: eventTemplate.rsvps.length,
      rsvps: eventTemplate.rsvps
    });
  } catch (error) {
    console.error('Get RSVPs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
