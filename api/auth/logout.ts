import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear the auth cookie
    res.setHeader('Set-Cookie', [
      'auth=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
    ]);

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
}
