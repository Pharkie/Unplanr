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

## How to Use

Simply visit [unplanr.com](https://unplanr.com) and sign in with your Google account. Select the events you want to delete and click "Delete Selected". That's it!

## For Developers

This is a free, open-source tool. The code is available here for transparency and educational purposes. The live instance is hosted and maintained for public use.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You're free to use, share, and modify this software for non-commercial purposes, as long as you give credit and share modifications under the same license.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Note that this project is licensed for non-commercial use only.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Pharkie/Unplanr/issues) on GitHub.

---

Made with care for people who value their time.
