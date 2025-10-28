import { Router } from 'express';
import { googleAuthService } from '../services/googleAuth.js';
import { calendarService } from '../services/calendarService.js';

const router = Router();

// Get auth URL for Google OAuth
router.get('/auth/google', (req, res) => {
  const authUrl = googleAuthService.getAuthUrl();
  res.json({ authUrl });
});

// Handle OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokens = await googleAuthService.getTokens(code);

    // Get user info
    const userInfo = await calendarService.getUserInfo(tokens);

    // Store in session
    req.session.tokens = tokens;
    req.session.user = {
      id: userInfo.id || '',
      email: userInfo.email || '',
      name: userInfo.name || '',
    };

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

// Check auth status
router.get('/auth/status', (req, res) => {
  if (req.session.tokens && req.session.user) {
    return res.json({
      authenticated: true,
      user: req.session.user,
    });
  }

  res.json({ authenticated: false });
});

// Logout
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

export default router;
