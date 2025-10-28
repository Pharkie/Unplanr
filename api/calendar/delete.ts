import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTokenFromCookie, verifyToken } from '../lib/jwt.js';
import { calendarService } from '../lib/calendarService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const token = getTokenFromCookie(req.headers.cookie);
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userData = await verifyToken(token);
    if (!userData) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if token is expired
    const expiryDate = userData.tokens?.expiry_date;
    if (expiryDate && Date.now() >= expiryDate) {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }

    // Validate request body
    const { eventIds, calendarId } = req.body;

    if (!calendarId) {
      return res.status(400).json({ error: 'calendarId is required' });
    }

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ error: 'eventIds must be a non-empty array' });
    }

    // Enforce 100 event limit
    if (eventIds.length > 100) {
      return res.status(400).json({
        error: 'Cannot delete more than 100 events at once',
        limit: 100,
        requested: eventIds.length
      });
    }

    // Delete events
    const result = await calendarService.deleteMultipleEvents(userData.tokens, calendarId, eventIds);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error deleting events:', error);
    res.status(500).json({
      error: 'Failed to delete events',
      message: error.message,
    });
  }
}
