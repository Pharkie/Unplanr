import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTokenFromCookie, verifyToken } from '../lib/jwt';
import { calendarService } from '../lib/calendarService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
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

    // Get events
    const maxResults = req.query.maxResults
      ? parseInt(req.query.maxResults as string)
      : 100;

    const events = await calendarService.listEvents(userData.tokens, maxResults);

    res.status(200).json({ events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message,
    });
  }
}
