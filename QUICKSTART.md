# Quick Start Guide

Get Unplanr running in 5 minutes!

## For Local Development

1. **Clone and install:**
```bash
git clone https://github.com/Pharkie/Unplanr.git
cd Unplanr
cd api && npm install
cd ../frontend && npm install
```

2. **Set up Google OAuth:**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Enable Google Calendar API
   - Create OAuth credentials
   - Add redirect URI: `http://localhost:3000/api/auth/callback`

3. **Configure environment:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Google credentials
```

4. **Run:**
```bash
vercel dev
```

Visit `http://localhost:3000`

## For Production (Vercel)

1. **Deploy:**
```bash
npm i -g vercel
vercel
```

2. **Add environment variables in Vercel dashboard:**
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_REDIRECT_URI (https://your-app.vercel.app/api/auth/callback)
   - JWT_SECRET (generate with: `openssl rand -base64 32`)
   - FRONTEND_URL (https://your-app.vercel.app)
   - NODE_ENV=production

3. **Connect domain** in Vercel settings

4. **Update Google OAuth** redirect URI to production domain

Done! See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
