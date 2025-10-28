import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if token is expired
  const expiryDate = req.session.tokens.expiry_date;
  if (expiryDate && Date.now() >= expiryDate) {
    // Token expired - client should refresh or re-authenticate
    return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
  }

  next();
};
