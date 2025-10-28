# Unplanr

A simple, elegant web-based tool for deleting multiple Google Calendar events through an intuitive visual interface.

## The Problem

Google Calendar's native interface makes it tedious to delete multiple events - you have to click through each event individually. Unplanr solves this by providing a visual interface where you can select and delete multiple calendar events at once.

## Features

- Visual calendar interface for easy event selection
- Bulk delete multiple events at once
- Secure Google OAuth authentication
- Clean, modern UI

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite (fast build tool)
- TailwindCSS (styling)

**Backend:**
- Node.js with Express
- TypeScript
- Google Calendar API integration

## Project Structure

```
Unplanr/
├── frontend/          # React application
├── backend/           # Express API server
├── README.md
├── claude.md          # Project context for AI assistants
└── LICENSE
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Google Cloud Console account (for Calendar API credentials)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Pharkie/Unplanr.git
cd Unplanr
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up Google Calendar API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

5. Configure environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Add your Google API credentials

### Development

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend development server:
```bash
cd frontend
npm run dev
```

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You're free to use, share, and modify this software for non-commercial purposes, as long as you give credit and share modifications under the same license.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Note that this project is licensed for non-commercial use only.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Pharkie/Unplanr/issues) on GitHub.

---

Made with care for people who value their time.
