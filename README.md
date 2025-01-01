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

## Docker Hub Deployment

The application is available on Docker Hub and can be pulled using:

```bash
docker pull joshpigford/sims:latest
```

To run the pulled image:

```bash
docker run -d \
  -p 8174:8174 \
  -p 8175:8175 \
  -v sims-db:/app/db \
  joshpigford/sims:latest
```

### Building and Publishing

The repository is configured with GitHub Actions to automatically build and push the Docker image to Docker Hub whenever changes are pushed to the main branch.

If you want to build and publish your own version:

1. Build the image:
   ```bash
   docker build -t yourusername/sims:latest .
   ```

2. Push to Docker Hub:
   ```bash
   docker login
   docker push yourusername/sims:latest
   ```

Note: The database file (`db/filaments.db`) is not included in the Docker image and will be created fresh when the container starts. Use Docker volumes to persist your data. 
