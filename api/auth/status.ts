import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTokenFromCookie, verifyToken } from '../lib/jwt.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromCookie(req.headers.cookie);

    if (!token) {
      return res.status(200).json({ authenticated: false });
    }

    const userData = await verifyToken(token);

    if (!userData) {
      return res.status(200).json({ authenticated: false });
    }

    res.status(200).json({
      authenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    });
  } catch (error: any) {
    console.error('Error checking auth status:', error);
    res.status(500).json({ error: 'Failed to check auth status' });
  }
}
