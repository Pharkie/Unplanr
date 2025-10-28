import type { VercelRequest, VercelResponse } from '@vercel/node';
import { calendarService } from '../lib/calendarService.js';
import { getTokenFromCookie, verifyToken } from '../lib/jwt.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromCookie(req.headers.cookie);
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userData = await verifyToken(token);
    if (!userData || !userData.tokens) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const calendars = await calendarService.listCalendars(userData.tokens);
    res.status(200).json(calendars);
  } catch (error: any) {
    console.error('Error listing calendars:', error);
    res.status(500).json({ error: 'Failed to list calendars' });
  }
}
