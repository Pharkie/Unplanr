import type { VercelRequest, VercelResponse } from '@vercel/node';
import { googleAuthService } from '../lib/googleAuth.js';
import { createToken } from '../lib/jwt.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  // Get the origin from the request (handles both production and local dev)
  const origin = req.headers.origin || `https://${req.headers.host}`;

  if (!code || typeof code !== 'string') {
    return res.redirect(`${origin}?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokens = await googleAuthService.getTokens(code);

    // Create JWT with tokens only - we don't need user profile info
    const userData = {
      tokens,
    };

    const jwt = await createToken(userData);

    // Set httpOnly cookie (Secure flag auto-detected from HTTPS)
    const isSecure = origin.startsWith('https://');
    res.setHeader('Set-Cookie', [
      `auth=${jwt}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax${
        isSecure ? '; Secure' : ''
      }`,
    ]);

    // Redirect back to the origin
    res.redirect(`${origin}?auth=success`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.redirect(`${origin}?error=auth_failed`);
  }
}
