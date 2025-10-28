import { Router } from 'express';
import { calendarService } from '../services/calendarService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All calendar routes require authentication
router.use(requireAuth);

// Get calendar events
router.get('/calendar/events', async (req, res) => {
  try {
    const maxResults = req.query.maxResults
      ? parseInt(req.query.maxResults as string)
      : 100;

    const events = await calendarService.listEvents(req.session.tokens, maxResults);

    res.json({ events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message,
    });
  }
});

// Delete multiple events
router.post('/calendar/events/delete', async (req, res) => {
  try {
    const { eventIds } = req.body;

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ error: 'eventIds must be a non-empty array' });
    }

    const result = await calendarService.deleteMultipleEvents(req.session.tokens, eventIds);

    res.json(result);
  } catch (error: any) {
    console.error('Error deleting events:', error);
    res.status(500).json({
      error: 'Failed to delete events',
      message: error.message,
    });
  }
});

export default router;
