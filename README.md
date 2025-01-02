# SIMS: Spool Inventory Management System

A modern web application for managing your 3D printer filament inventory. Built with React, TypeScript, and SQLite, SIMS helps you keep track of your filament collection with a clean, responsive interface.

![CleanShot 2024-12-31 at 19 26 25@2x](https://github.com/user-attachments/assets/37979d7f-9ca2-42ba-b475-0cd54b84b5a3)

## Features

- **Comprehensive Filament Tracking**
  - Material types and manufacturers
  - Quantity management with minimum stock alerts
  - Color visualization
  - Detailed notes and specifications

- **Smart Organization**
  - Sort by name, material, quantity, or manufacturer
  - Search functionality
  - Quick edit and delete operations

- **Robust Architecture**
  - Offline-first with SQLite database
  - Automatic database migrations
  - RESTful API
  - Modern, responsive UI

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Vite for fast builds and development
- Tailwind CSS for modern styling
- HeadlessUI for accessible components
- React Hook Form for form management

### Backend
- Express.js with TypeScript
- SQLite3 for persistent storage
- Automated database migrations
- CORS enabled API

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Shpigford/sims.git
   cd sims
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. Start the development servers:
   ```bash
   # Run both frontend and backend
   npm run dev:all

   # Or run them separately:
   npm run frontend  # Frontend only
   npm run backend   # Backend only
   ```

4. Open your browser and navigate to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8175

## Database

SIMS uses SQLite for data storage, providing several benefits:
- **Portable**: All data is stored in a single file (`db/filaments.db`)
- **Offline-First**: No internet connection required
- **Zero Configuration**: No separate database server needed
- **Automatic Backups**: Easy to backup with file system tools

## API Endpoints

### Filaments
- `GET /api/filaments` - List all filaments
- `POST /api/filaments` - Add a new filament
- `PUT /api/filaments/:id` - Update a filament
- `DELETE /api/filaments/:id` - Delete a filament

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
