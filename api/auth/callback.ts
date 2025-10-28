import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleAuthService } from '../lib/googleAuth';
import { calendarService } from '../lib/calendarService';
import { createToken } from '../lib/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code || typeof code !== 'string') {
    return res.redirect(`${frontendUrl}?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokens = await googleAuthService.getTokens(code);

    // Get user info
    const userInfo = await calendarService.getUserInfo(tokens);

    // Create JWT with user data and tokens
    const userData = {
      id: userInfo.id || '',
      email: userInfo.email || '',
      name: userInfo.name || '',
      tokens,
    };

    const jwt = await createToken(userData);

    // Set httpOnly cookie
    res.setHeader('Set-Cookie', [
      `auth=${jwt}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`,
    ]);

    // Redirect to frontend
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.redirect(`${frontendUrl}?error=auth_failed`);
  }
}
