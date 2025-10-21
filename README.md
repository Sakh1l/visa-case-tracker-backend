# VisaCase Tracker

Full-stack visa case management system with React frontend and Express backend.

## Features
- REST API for visa case management
- Supabase integration (auth, db, email)
- File upload endpoints for Excel/CSV
- Case sharing with secure links
- Modern React UI with responsive design

## Quick Start

Run both frontend and backend with one command:

```bash
npm run dev
```

Or use the shell script:

```bash
./dev.sh
```

This will start:
- Backend API on http://localhost:4000
- Frontend app on http://localhost:5173

## Manual Setup

### Backend only
```bash
npm start
```

### Frontend only
```bash
cd frontend
npm run dev
```

## Environment Variables

Configure `.env` in the root directory with your Supabase credentials (already configured).
