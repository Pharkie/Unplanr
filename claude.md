# Unplanr - Project Context

## Project Overview

Unplanr is a web-based tool that solves one specific problem: bulk deletion of Google Calendar events through a visual interface. The native Google Calendar interface requires users to delete events one by one, which is tedious and time-consuming. Unplanr provides a better UX for this common task.

## Core Problem Statement

**Problem:** Deleting multiple Google Calendar events is tedious - you must click through each event individually.

**Solution:** Unplanr provides a visual calendar interface where users can select multiple events and delete them in bulk.

## Architecture

### Frontend (`/frontend`)
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (fast, modern, minimal config)
- **Styling:** TailwindCSS (utility-first, no bloat)
- **Key Features:**
  - Google OAuth login flow
  - Calendar event visualization
  - Multi-select interface for events
  - Bulk delete confirmation

### Backend (`/backend`)
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Key Responsibilities:**
  - Handle Google OAuth flow
  - Proxy requests to Google Calendar API
  - Manage API credentials securely
  - Rate limiting and error handling

## Tech Stack Rationale

**Why React?**
- Component model is perfect for interactive calendar UI
- Large ecosystem for calendar components
- Easy state management for selected events

**Why Vite?**
- Fast dev server with HMR
- Minimal configuration needed
- Modern build output

**Why TypeScript?**
- Google Calendar API has excellent type definitions
- Catches errors at compile time
- Better IDE autocomplete and refactoring
- Not significantly more complex for this use case

**Why TailwindCSS?**
- Rapid UI development without writing custom CSS
- Consistent design system out of the box
- Tree-shaking removes unused styles
- Easy to create clean, modern interfaces

**Why separate frontend/backend?**
- Frontend can be deployed to static hosting (Vercel, Netlify)
- Backend handles sensitive OAuth credentials
- Clear separation of concerns
- Backend can be deployed to serverless functions

## Key Integration: Google Calendar API

### Authentication Flow
1. User clicks "Login with Google"
2. Backend initiates OAuth flow
3. User grants calendar permissions
4. Backend receives OAuth tokens
5. Frontend stores session/token
6. Frontend makes authenticated requests through backend

### API Operations Needed
- List calendar events (read)
- Delete events (write)
- Handle pagination for large event lists

### Security Considerations
- OAuth tokens stored securely (httpOnly cookies or backend session)
- Never expose client secret in frontend
- CORS properly configured
- Rate limiting to prevent abuse

## Development Guidelines

### Code Style
- Use ESLint + Prettier for consistent formatting
- Prefer functional components (React)
- Use async/await over promises
- Clear, descriptive variable names
- Add comments for complex logic only

### File Organization

**Frontend:**
```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── services/       # API calls to backend
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
└── App.tsx         # Main app component
```

**Backend:**
```
src/
├── routes/         # Express route handlers
├── services/       # Business logic (Google API calls)
├── middleware/     # Auth, error handling, etc.
├── types/          # TypeScript type definitions
└── server.ts       # Express app setup
```

### Environment Variables

**Backend `.env`:**
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:3001
```

## Future Extensibility

While the MVP focuses on deletion, the architecture supports future features:
- Filter events by date range, calendar, or search term
- Edit event details in bulk
- Export/backup events before deletion
- Duplicate event detection
- Recurring event handling
- Multiple calendar support

## Non-Goals (Keep it Simple)

- **Not** a full calendar management app
- **Not** a calendar sync tool
- **Not** trying to replace Google Calendar
- **Not** supporting every calendar provider (Google only for now)

## License

CC BY-NC-SA 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0)
- Non-commercial use only
- Must provide attribution
- Share-alike: modifications must use same license
- Chosen to prevent commercial exploitation while allowing personal/educational use

## Development Status

**Current Phase:** Initial setup and scaffolding

**Next Steps:**
1. Set up basic React + Vite frontend
2. Set up basic Express + TypeScript backend
3. Implement Google OAuth flow
4. Create calendar event list view
5. Implement event selection UI
6. Add bulk delete functionality
7. Polish UI/UX
8. Testing and deployment

## Notes for AI Assistants

- This project values **simplicity over features** - don't over-engineer
- Prioritize **user experience** - the whole point is to save users time
- Keep dependencies minimal - every dependency is maintenance burden
- TypeScript strict mode is preferred
- Write tests for critical paths (OAuth, deletion)
- Focus on the core use case before adding features

### Deployment Workflow

**CRITICAL RULE - READ THIS EVERY TIME:**

**NEVER RUN `git push` OR ANY DEPLOYMENT COMMANDS WITHOUT ASKING FIRST**

**DO NOT PUSH TO GIT WITHOUT EXPLICIT USER APPROVAL**

**The Rule:**
After completing ANY code changes, you MUST:
1. Show the user what you changed
2. Ask: "Ready to deploy, or do you want to make more changes?"
3. **WAIT for explicit confirmation** before running ANY deployment command

**NO EXCEPTIONS:**
- Even if the user's request seems urgent
- Even if the user says "fix this" or "change that"
- Even if you think they want it deployed
- **ALWAYS ASK FIRST**

**Why:**
- Deployments take ~2 minutes each
- User often wants to batch multiple changes together
- User will explicitly tell you when to deploy

**Deployment Method:**

**CRITICAL: DO NOT USE THE `vercel` COMMAND TO DEPLOY**

This project uses **GitHub integration** - Vercel automatically deploys when you push to GitHub.

**When user says "deploy", the ONLY command you run is:**
```bash
git push
```

**That's it. Just `git push`. Vercel will automatically deploy. You are DONE. Do NOT run any other commands.**

**NEVER RUN THESE COMMANDS:**
- `vercel`
- `vercel --prod`
- `vercel --prod --yes`
- `vercel deploy`
- `vercel deploy --prod`
- `git push && vercel --prod --yes`
- ANY command containing the word "vercel"

**Why you must NOT run `vercel` commands:**
- GitHub integration AUTOMATICALLY triggers Vercel deployment when you push
- Running `vercel --prod` creates a SECOND duplicate deployment (wastes resources)
- **`git push` is the ONLY deployment command needed**

**To be absolutely clear:**
1. User says "deploy"
2. You run: `git push`
3. GitHub receives the push
4. GitHub automatically tells Vercel to deploy
5. Vercel builds and deploys automatically
6. **You are DONE** - do NOT run `vercel` or any other command

**After Deploying:**
- Vercel builds take ~2 minutes - this is NORMAL
- Check deployment status ONCE after 60-90 seconds with: `vercel ls --yes | head -5`
- Do NOT spam BashOutput every 5 seconds - it's annoying and wastes tokens
- The build will complete on its own - just wait patiently

**Additional Notes:**
- There is NO local development environment - deploy directly to Vercel for testing
- Never suggest "test locally"

## UI/UX Layout Considerations

### Ko-fi Widget Integration
The site uses a Ko-fi floating widget (loaded via script in `index.html`) that appears as a "Tip Me" button in the bottom left corner.

**CRITICAL LAYOUT RULE:**
- The Ko-fi button occupies approximately 100px of space in the bottom left corner on both mobile and desktop
- **NEVER** override the Ko-fi widget's z-index or attempt to place UI elements on top of it
- **DO** account for the Ko-fi button when designing bottom-positioned UI elements
- **DO** position important information and interactive elements to the right side to avoid overlap

**Mobile Bottom Drawer:**
- Uses `justify-end` to push content (selection count, delete button) to the right
- Leaves the left ~100px clear for Ko-fi button
- Bottom margin (`mb-24`) is applied OUTSIDE the rounded container, not inside, for cleaner appearance

**Desktop Sidebar:**
- Positioned on the right side, naturally avoids Ko-fi button
- No special considerations needed
