# Deployment Guide for Unplanr

This guide will walk you through deploying Unplanr to Vercel for free.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com) - it's free!)
- Google Cloud Console account
- Domain name purchased (e.g., unplanr.com)

## Step 1: Set Up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For testing: `http://localhost:3000/api/auth/callback`
     - For production: `https://unplanr.com/api/auth/callback`
   - Save the Client ID and Client Secret

## Step 2: Push Code to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/yourusername/Unplanr.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the configuration from `vercel.json`
4. Click "Deploy"

### Option B: Deploy via CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## Step 4: Configure Environment Variables

In the Vercel dashboard (Settings > Environment Variables), add:

| Variable | Value | Example |
|----------|-------|---------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | `GOCSPX-xxxxxxxxxxxxx` |
| `GOOGLE_REDIRECT_URI` | Your callback URL | `https://unplanr.com/api/auth/callback` |
| `JWT_SECRET` | Random secret string | Generate with: `openssl rand -base64 32` |
| `FRONTEND_URL` | Your domain | `https://unplanr.com` |
| `NODE_ENV` | Environment | `production` |

**Important:** Make sure to add these variables to "Production", "Preview", and "Development" environments.

## Step 5: Connect Your Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add your domain (e.g., `unplanr.com`)
4. Vercel will provide DNS records to add

### Update DNS Records

Go to your domain registrar and add the DNS records provided by Vercel:

**For apex domain (unplanr.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

DNS propagation can take up to 48 hours, but usually completes within minutes.

## Step 6: Update Google OAuth Settings

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Update authorized redirect URIs to include your production domain:
   - `https://unplanr.com/api/auth/callback`
   - `https://www.unplanr.com/api/auth/callback` (if using www)

## Step 7: Test Your Deployment

1. Visit your domain: `https://unplanr.com`
2. Click "Login with Google"
3. Authorize calendar access
4. Try viewing and deleting events

## Troubleshooting

### OAuth Error: redirect_uri_mismatch
- Make sure the redirect URI in Google Cloud Console exactly matches your Vercel domain
- Check that `GOOGLE_REDIRECT_URI` environment variable is correct
- Redeploy after updating environment variables

### 401 Unauthorized Errors
- Verify `JWT_SECRET` is set in Vercel environment variables
- Clear browser cookies and try logging in again

### API Functions Timing Out
- Check Vercel function logs in the dashboard
- Make sure you're not trying to delete more than 100 events at once
- Verify Google API credentials are correct

### Domain Not Working
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records match what Vercel provided
- Try clearing DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

## Cost Breakdown

- **Vercel Hosting:** FREE (Hobby tier)
  - 100 GB bandwidth/month
  - Unlimited API requests
  - Automatic HTTPS
  - Global CDN

- **Google Calendar API:** FREE
  - 1 billion requests/day quota
  - More than enough for personal use

- **Domain:** ~$12-15/year
  - Your only cost!

## Monitoring and Maintenance

### View Logs
Go to Vercel dashboard > Your Project > Logs to see:
- API function invocations
- Error messages
- Performance metrics

### Update Deployment
Just push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will automatically deploy the changes.

### Rollback
If something breaks:
1. Go to Vercel dashboard > Deployments
2. Find a previous working deployment
3. Click "Promote to Production"

## Security Best Practices

1. **Never commit `.env` or `.env.local` files** - they're in `.gitignore`
2. **Regenerate JWT_SECRET periodically** (every 3-6 months)
3. **Monitor Vercel usage** to ensure you stay within free tier limits
4. **Review OAuth scopes** - only request calendar permissions needed
5. **Keep dependencies updated** - run `npm audit` regularly

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Google Calendar API Docs](https://developers.google.com/calendar)
- [Open an issue](https://github.com/Pharkie/Unplanr/issues)

---

Congratulations! Your Unplanr instance is now live and free to use! 🎉
