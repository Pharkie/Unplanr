import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Unplanr API is running' });
});

// Placeholder routes
app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: false });
});

// TODO: Add Google OAuth routes
// TODO: Add calendar event routes

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Unplanr backend running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${FRONTEND_URL}`);
});
