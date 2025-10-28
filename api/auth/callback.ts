import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleAuthService } from '../lib/googleAuth.js';
import { createToken } from '../lib/jwt.js';

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

    // Create JWT with tokens only - we don't need user profile info
    const userData = {
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
