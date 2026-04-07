# Bida Management

`Bida Management` is a full-stack billiard club management system for live table operations, F&B ordering, checkout, customer tracking, and admin reporting.

The codebase includes:

- A Node.js + Express + MongoDB backend with JWT authentication and Socket.IO
- A React + TypeScript + Vite frontend with separate admin and staff workflows
- Master-data CRUD for billiard `table types` and F&B `categories`
- Real-time table status refresh across active screens

## Feature Overview

### Authentication and access control

- Login, register, token refresh, and current-user lookup
- Role-aware frontend navigation for `admin` and `staff`
- Protected backend routes with admin-only enforcement where required

### Table and session workflow

- Live dashboard for table status
- Start a session on an available table
- Track elapsed play time and estimated table cost
- Close a session and calculate final billing
- Socket.IO-based refresh on table status changes

### F&B workflow

- CRUD for F&B menu items
- CRUD for F&B category master data
- Add F&B orders to active table sessions
- Read-only staff menu for service-side lookup

### Admin operations

- CRUD for billiard tables
- CRUD for table type master data
- Revenue analytics
- Customer CRM management

### Staff operations

- Dedicated table service screen
- Read-only service menu
- Shared profile and notification screens

## Current Domain Model

The main backend domains currently covered are:

- Users
- Tables
- Table types
- Sessions
- F&B items
- F&B categories
- Orders
- Revenue
- Customers

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
- Express 5
- MongoDB with Mongoose
- JWT
- Socket.IO
- bcrypt

## Architecture

The repository contains two applications:

- `client/`: React frontend
- `server/`: Express API + Socket.IO server

The backend follows a layered structure:

- `routes/` for HTTP endpoints
- `controllers/` for request handling
- `services/` for business rules
- `repositories/` for database access
- `models/` and `entities/` for Mongoose definitions
- `middleware/` for auth, roles, and centralized error handling

The frontend is organized by:

- `pages/` for main screens
- `components/` for shared UI
- `services/` for API clients
- `context/` for auth state
- `styles/` for screen/component styling
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
│   ├── .env.example
│   └── package.json
├── docs/
├── tasks/
└── README.md
```

## Prerequisites

Before running locally, make sure you have:

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

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd ../client
npm install
```

## Environment Setup

### Backend

The repository already includes `server/.env.example`. Copy it to `server/.env` and adjust the values:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/bida-management
JWT_SECRET=replace-with-a-secure-secret
JWT_REFRESH_SECRET=replace-with-a-secure-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Frontend

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Port Alignment Note

The frontend defaults to `http://localhost:3000/api` when `VITE_API_URL` is not provided.

The backend defaults to port `5000` when `PORT` is missing in `server/.env`.

To avoid a broken local setup, do one of these:

1. Recommended: set `PORT=3000` in `server/.env` and keep the frontend env above.
2. Or keep backend on `5000` and set:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

## Running the App

Start backend:

```bash
cd server
npm run dev
```

Start frontend in another terminal:

```bash
cd client
npm run dev
```

Then open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api` or `http://localhost:5000/api`, depending on your env setup

## Available Scripts

### Backend

From `server/`:

- `npm run dev`: start backend in watch mode
- `npm start`: start backend normally

### Frontend

From `client/`:

- `npm run dev`: start Vite dev server
- `npm run build`: type-check and create production bundle
- `npm run lint`: run ESLint
- `npm run preview`: preview the production build

## API Overview

All non-auth routes require a valid JWT.

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

### Table Types

- `GET /api/table-types`
- `GET /api/table-types/:id`
- `POST /api/table-types`
- `PUT /api/table-types/:id`
- `DELETE /api/table-types/:id`

### Sessions

- `POST /api/sessions/start`
- `POST /api/sessions/:id/end`
- `GET /api/sessions/:id`
- `GET /api/sessions`

### F&B Items

- `GET /api/fnb`
- `GET /api/fnb/:id`
- `POST /api/fnb`
- `PUT /api/fnb/:id`
- `DELETE /api/fnb/:id`

### F&B Categories

- `GET /api/fnb-categories`
- `GET /api/fnb-categories/:id`
- `POST /api/fnb-categories`
- `PUT /api/fnb-categories/:id`
- `DELETE /api/fnb-categories/:id`

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

Current events in the codebase:

- `table:getAll`
- `table:statusChange`

## Role Access

### Admin

- Dashboard
- Table management
- F&B management
- Customer CRM
- Revenue reports
- Profile
- Notifications

### Staff

- Dashboard
- Table service operations
- Service menu
- Customer CRM
- Profile
- Notifications

## Current Notes

- The frontend uses in-app page switching instead of React Router.
- The frontend build currently succeeds, but Vite still reports a large bundle warning.
- Table types and F&B categories are now managed as master data, while tables and F&B items still store the selected `code` as a string for compatibility.

## Future Improvements

- Add automated tests for critical flows
- Add seed scripts and demo users
- Improve production deployment documentation
- Reduce the large frontend bundle through code splitting
- Add Docker-based local development support

## License

This repository does not currently include a license file. Add one before distributing the project beyond internal or educational use.
