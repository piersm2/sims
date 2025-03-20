# SIMS: Spool Inventory Management System

A modern web application for managing your 3D printer filament inventory. Built with React, TypeScript, and SQLite, SIMS helps you keep track of your filament collection with a clean, responsive interface.

![CleanShot 2024-12-31 at 19 26 25@2x](https://github.com/user-attachments/assets/37979d7f-9ca2-42ba-b475-0cd54b84b5a3)

## Features

- **Comprehensive Filament Tracking**
  - Material types and manufacturers
  - Quantity management with minimum stock alerts
  - Color visualization
  - Detailed notes and specifications

- **3D Printer Management**
  - Track all your printers in one place
  - Associate printers with filament types
  - Monitor printer status and maintenance

- **Print Queue System**
  - Manage ongoing and upcoming print jobs
  - Assign prints to specific printers
  - Track print status and completion
  - Select filament colors for each print

- **Purchase List**
  - Automated low-stock tracking
  - Shopping list for filament reordering
  - Track filament suppliers and pricing

- **Parts Inventory**
  - Monitor replacement and spare parts
  - Track part quantities with minimum stock alerts
  - Associate parts with specific printers
  - Store supplier information and part numbers

- **Product Pricing & Profitability**
  - Calculate costs and pricing for printed products
  - Track filament usage per product
  - Labor cost calculations with hourly rates
  - Profit margin analysis and suggested pricing
  - Wear & tear cost estimations
  - Platform fee calculations for online sellers

- **Smart Organization**
  - Sort by name, material, quantity, or manufacturer
  - Search functionality across all inventory
  - Quick edit and delete operations
  - Filter products, parts, and filaments

- **Robust Architecture**
  - Offline-first with SQLite database
  - Automatic database migrations
  - RESTful API
  - Modern, responsive UI
  - Containerized with Docker for easy deployment

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

### Printers
- `GET /api/printers` - List all printers
- `POST /api/printers` - Add a new printer
- `PUT /api/printers/:id` - Update a printer
- `DELETE /api/printers/:id` - Delete a printer

### Print Queue
- `GET /api/print-queue` - List all print queue items
- `POST /api/print-queue` - Add a new print queue item
- `PUT /api/print-queue/:id` - Update a print queue item
- `DELETE /api/print-queue/:id` - Delete a print queue item

### Purchase List
- `GET /api/purchase-list` - List all purchase items
- `POST /api/purchase-list` - Add a new purchase item
- `PUT /api/purchase-list/:id` - Update a purchase item
- `DELETE /api/purchase-list/:id` - Delete a purchase item

### Parts
- `GET /api/parts` - List all parts
- `POST /api/parts` - Add a new part
- `PUT /api/parts/:id` - Update a part
- `DELETE /api/parts/:id` - Delete a part

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Add a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
