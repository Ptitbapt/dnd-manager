# DnD Shop Generator

A Next.js application for Dungeon Masters to manage items and generate random shops for D&D sessions.

## Features

- Manage D&D items (add, edit, delete)
- Generate random shops based on rarity and type distribution
- Save and reload shop configurations
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- Node.js 14.0 or later
- SQLite Database (included)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/dnd-shop-generator.git
   cd dnd-shop-generator
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up the database

   ```bash
   npx prisma generate
   ```

4. Run the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js application pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and database operations
- `/prisma` - Database schema and configuration

## Database Configuration

The application uses SQLite via Prisma ORM. The existing database file (`db_ITEMS.db`) contains your D&D items data.

## GitHub Setup

To push your project to GitHub:

1. Initialize a Git repository

   ```bash
   git init
   ```

2. Add all files to staging

   ```bash
   git add .
   ```

3. Commit your changes

   ```bash
   git commit -m "Initial commit"
   ```

4. Create a repository on GitHub and push your code
   ```bash
   git remote add origin https://github.com/yourusername/dnd-shop-generator.git
   git push -u origin main
   ```

## Tech Stack

- Next.js 14
- Prisma (SQLite)
- TailwindCSS
- React
