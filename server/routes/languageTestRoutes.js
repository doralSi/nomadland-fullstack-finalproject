import express from 'express';
import Point from '../models/Point.js';
import EventTemplate from '../models/EventTemplate.js';

const router = express.Router();

// Test language filtering
router.get('/test', async (req, res) => {
  try {
    // Get language statistics
    const pointStats = await Point.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);

    const eventStats = await EventTemplate.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);

    // Sample points by language
    const hebrewPoints = await Point.find({ language: 'he' }).limit(3).select('title language');
    const englishPoints = await Point.find({ language: 'en' }).limit(3).select('title language');

    // Sample events by language
    const hebrewEvents = await EventTemplate.find({ language: 'he' }).limit(3).select('title language');
    const englishEvents = await EventTemplate.find({ language: 'en' }).limit(3).select('title language');

    res.json({
      message: 'Language system test',
      supportedLanguages: ['he', 'en'],
      filteringRules: {
        hebrewMode: 'Shows content in Hebrew (he) AND English (en)',
        englishMode: 'Shows content in English (en) ONLY',
        mapRangersAndAdmins: 'See ALL content regardless of language'
      },
      statistics: {
        points: pointStats,
        events: eventStats
      },
      samples: {
        hebrewPoints,
        englishPoints,
        hebrewEvents,
        englishEvents
      },
      testQueries: {
        hebrewMode: {
          pointsQuery: '/api/points?languages=he,en',
          eventsQuery: '/api/events?languages=he,en&from=2025-01-01&to=2025-12-31'
        },
        englishMode: {
          pointsQuery: '/api/points?languages=en',
          eventsQuery: '/api/events?languages=en&from=2025-01-01&to=2025-12-31'
        }
      }
    });
  } catch (error) {
    console.error('Language test error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;
