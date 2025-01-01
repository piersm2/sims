# SIMS: Spool Inventory Management System

A modern web app to track your 3D printer filament inventory. It's built with React, TypeScript, and SQLite.

![CleanShot 2024-12-31 at 19 26 25@2x](https://github.com/user-attachments/assets/37979d7f-9ca2-42ba-b475-0cd54b84b5a3)

## Features

- Track multiple filaments with detailed information
- Material type categorization
- Manufacturer information
- Color visualization
- Offline-capable with SQLite database
- Modern, responsive UI
- Containerized deployment with Docker

## Tech Stack

- Frontend:
  - React with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - HeadlessUI for components
  - React Hook Form for form handling

- Backend:
  - Express.js
  - SQLite3 for database
  - TypeScript

## Setup

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed on your system.

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Open your browser and navigate to:
   - Frontend: http://localhost:8174
   - Backend API: http://localhost:8175

### Manual Setup

1. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

2. Start the development servers:
   ```bash
   # Run both frontend and backend
   npm run dev:all

   # Or run them separately:
   npm run frontend  # Frontend only
   npm run backend   # Backend only
   ```

3. Open your browser and navigate to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Database

The application uses SQLite, which stores data in a local file (`db/filaments.db`). This makes it:
- Portable
- Offline-capable
- Easy to backup
- No need for a separate database server

When using Docker, the database file is persisted using a Docker volume.

## API Endpoints

- `GET /api/filaments` - List all filaments
- `POST /api/filaments` - Add a new filament
- `PUT /api/filaments/:id` - Update a filament
- `DELETE /api/filaments/:id` - Delete a filament

## Development

The application is containerized using Docker, making it easy to develop and deploy. The Docker setup includes:
- Hot-reloading for both frontend and backend
- Volume mounts for live code updates
- Persistent database storage
- Automatic container restart on crashes 
