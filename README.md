# Bida Management

Bida Management is a full-stack billiard club management system built for day-to-day table operations, food and beverage ordering, billing, staff workflows, and admin reporting.

The project includes:

- A Node.js + Express backend with MongoDB, JWT authentication, and Socket.IO
- A React + Vite frontend with role-aware screens for admin and staff
- Real-time table status refresh for active operations

## Features

### Authentication and roles

- JWT-based login, registration, token refresh, and current-user lookup
- Role-aware UI behavior for `admin` and `staff`
- Admin-only backend protection for restricted resources

### Table operations

- Live table dashboard with status visibility
- Start a session for an available table
- Track active session elapsed time and estimated table cost
- Complete checkout and generate a final session summary
- Real-time dashboard refresh through Socket.IO table events

### Food and beverage workflow

- Admin CRUD for menu items
- Staff can add F&B items to an active table session
- Existing and new session orders are summarized in the table action modal

### Admin tools

- Table management page for billiard table CRUD
- F&B management page for menu maintenance
- Revenue analytics page for admin-only reporting

### Staff tools

- Dedicated staff table operations page
- Read-only staff menu page
- My Profile and Notifications pages shared across roles

### Backend domain coverage

- Users
- Tables
- Sessions
- Orders
- F&B items
- Revenue
- Customers and loyalty-style visit / points endpoints

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Axios
- Socket.IO Client
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Socket.IO
- bcrypt

## Architecture

The repository is split into two applications:

- `client/`: React frontend
- `server/`: Express API and Socket.IO server

The backend follows a layered structure:

- `routes/` for HTTP endpoints
- `controllers/` for request handling
- `services/` for business logic
- `repositories/` for database access
- `models/` and `entities/` for Mongoose schemas and model exports
- `middleware/` for auth, role checks, and error handling

The frontend is organized by:

- `pages/` for major screens
- `components/` for reusable UI pieces
- `services/` for API access
- `context/` for authentication state
- `styles/` for page/component styling
- `utils/` for formatting and navigation helpers

## Repository Structure

```text
bida-management/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── entities/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── docs/
├── rules/
├── tasks/
└── README.md
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18 or newer
- npm
- A running MongoDB instance

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Bida-management
```

### 2. Install dependencies

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Environment Configuration

This project does not currently ship with a `.env.example`, so create the environment files manually.

### Backend environment

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/bida-management
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRE=1d
JWT_REFRESH_SECRET=replace-with-a-secure-refresh-secret
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Frontend environment

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Important Local Setup Note

The frontend fallback API URL is `http://localhost:3000/api`, but the backend fallback port in code is `5000`.

That means you should do one of the following:

1. Recommended: set `PORT=3000` in `server/.env` and keep the frontend values above.
2. Or run the backend on port `5000` and change the frontend env values to:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

If you do not align these values, the frontend will fail to reach the API.

## Running the Application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Then open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api` or `http://localhost:5000/api`, depending on your env setup

## Available Scripts

### Frontend

From `client/`:

- `npm run dev`: start the Vite development server
- `npm run build`: run TypeScript build and create a production bundle
- `npm run lint`: run ESLint
- `npm run preview`: preview the production build locally

### Backend

From `server/`:

- `npm run dev`: start the backend with file watching
- `npm start`: start the backend normally

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Tables

- `GET /api/tables`
- `GET /api/tables/:id`
- `POST /api/tables`
- `PUT /api/tables/:id`
- `DELETE /api/tables/:id`

### Sessions

- `POST /api/sessions/start`
- `POST /api/sessions/:id/end`
- `GET /api/sessions/:id`
- `GET /api/sessions`

### F&B

- `GET /api/fnb`
- `GET /api/fnb/:id`
- `POST /api/fnb`
- `PUT /api/fnb/:id`
- `DELETE /api/fnb/:id`

### Orders

- `POST /api/orders`
- `GET /api/orders/:sessionId`
- `GET /api/orders/:sessionId/total`

### Revenue

- `GET /api/revenue/daily`
- `GET /api/revenue/monthly`
- `GET /api/revenue/summary`

### Customers

- `GET /api/customers`
- `GET /api/customers/phone/:phone`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`
- `POST /api/customers/:id/visit`
- `POST /api/customers/:id/points`

## Real-Time Events

Socket.IO is used for live table updates.

Current events in the codebase include:

- `table:getAll`
- `table:statusChange`

## Roles and Access

### Admin

- Dashboard
- Table management
- F&B management
- Revenue analytics
- Profile and notifications

### Staff

- Table service operations
- Staff menu view
- Profile and notifications

## Current Status

The project already includes the core workflow for:

- Authentication
- Role-aware frontend navigation
- Table operations
- Session start and checkout
- F&B ordering
- Admin management pages
- Revenue reporting
- Real-time table refresh

There are still areas that can be improved, especially:

- Automated tests
- Better production deployment setup
- Bundle size optimization on the frontend
- More complete documentation for seeding, demo accounts, and deployment

## Known Notes

- The frontend production build currently completes successfully, but Vite reports a large main bundle warning.
- The app uses in-app page switching instead of React Router.
- Some backend validation and messages still reflect earlier project language choices; the system behavior is in place, but polish can be improved further.

## Future Improvements

- Add `.env.example` files for both frontend and backend
- Add database seed scripts and sample users
- Add automated tests for critical business flows
- Add Docker support
- Split the frontend bundle to reduce the large chunk warning
- Introduce production-ready deployment documentation

## License

This project currently has no explicit license file in the repository. Add one before distributing or using it beyond internal or educational purposes.
