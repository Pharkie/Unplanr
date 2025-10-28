# Unplanr

A simple, elegant web-based tool for deleting multiple Google Calendar events through an intuitive visual interface.

## The Problem

Google Calendar's native interface makes it tedious to delete multiple events - you have to click through each event individually. Unplanr solves this by providing a visual interface where you can select and delete multiple calendar events at once.

## Features

- Visual calendar interface for easy event selection
- Bulk delete up to 100 events at once
- Secure Google OAuth authentication
- Clean, modern UI
- Free hosting on Vercel

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite (fast build tool)
- TailwindCSS (styling)

**Backend:**
- Vercel Serverless Functions
- TypeScript
- Google Calendar API integration
- JWT-based authentication

## Project Structure

```
Unplanr/
├── frontend/          # React application
├── api/               # Vercel serverless functions
│   ├── auth/          # Authentication endpoints
│   ├── calendar/      # Calendar API endpoints
│   └── lib/           # Shared utilities
├── backend/           # Legacy Express server (deprecated)
├── README.md
├── vercel.json        # Vercel deployment config
├── claude.md          # Project context for AI assistants
└── LICENSE
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Google Cloud Console account (for Calendar API credentials)
- Vercel account (free tier)

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Pharkie/Unplanr.git
cd Unplanr
```

2. Install dependencies:
```bash
# Install API dependencies
cd api && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. Set up Google Calendar API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback`

4. Configure environment variables:
   - Copy `.env.local.example` to `.env.local` in the project root
   - Add your Google API credentials

5. Start development server:
```bash
# From project root
vercel dev
```

This will start both frontend and API locally on `http://localhost:3000`

### Deploying to Vercel (Free Hosting)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (your-domain.vercel.app/api/auth/callback)
   - `JWT_SECRET` (generate with: `openssl rand -base64 32`)
   - `FRONTEND_URL` (your-domain.vercel.app)
   - `NODE_ENV=production`

4. Connect your custom domain (unplanr.com):
   - In Vercel dashboard, go to Settings > Domains
   - Add your domain
   - Update DNS records as instructed by Vercel

5. Update Google OAuth redirect URI:
   - Go back to Google Cloud Console
   - Add `https://unplanr.com/api/auth/callback` to authorized redirect URIs
   - Update `GOOGLE_REDIRECT_URI` environment variable in Vercel

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You're free to use, share, and modify this software for non-commercial purposes, as long as you give credit and share modifications under the same license.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Note that this project is licensed for non-commercial use only.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Pharkie/Unplanr/issues) on GitHub.

---

Made with care for people who value their time.
