import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleAuthService } from '../lib/googleAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUrl = googleAuthService.getAuthUrl();
    res.status(200).json({ authUrl });
  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
}
