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

**IMPORTANT:**
- **NEVER suggest "test locally"** - there is NO local development environment for this project
- **ALWAYS deploy directly to Vercel** for testing
- **ALWAYS ASK before deploying** - user often wants more changes bundled together
- Deployments take ~2 minutes each, so batch changes when possible
- Only deploy when explicitly asked or after confirming: "Ready to deploy?"
