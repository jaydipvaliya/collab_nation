# CollabNation

CollabNation is a MERN platform where founders, developers, designers, and marketers can team up to build startups together.

## Stack

- Frontend: React, React Router, Axios, Vite
- Backend: Node.js, Express, JWT-ready structure
- Database: MongoDB with Mongoose

## Project Structure

```text
Collab_Nation/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   |-- healthController.js
|   |   `-- startupController.js
|   |-- middleware/
|   |   `-- errorHandler.js
|   |-- models/
|   |   |-- Application.js
|   |   |-- Message.js
|   |   |-- Notification.js
|   |   |-- Startup.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- healthRoutes.js
|   |   `-- startupRoutes.js
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- .gitignore
|-- package.json
`-- README.md
```

## Included Starter Features

- Express server with CORS, dotenv, JSON parsing, and centralized error handling
- MongoDB connection helper using Mongoose
- Sample `User` and `Startup` models plus placeholder collections for `Applications`, `Messages`, and `Notifications`
- Sample API routes:
  - `GET /api/health`
  - `GET /api/startups`
  - `GET /api/startups/:startupId`
- React app with routing for:
  - Home
  - Explore Startups
  - Startup Detail
  - Profile
  - Dashboard
  - Login
  - Register
- Axios service layer ready for JWT headers
- Temporary client-side auth context to support the UI until backend auth routes are added

## Setup

Install dependencies:

```bash
npm install --prefix server
npm install --prefix client
```

Create `server/.env` from `server/.env.example`:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/collabnation
JWT_SECRET=replace_with_a_secure_secret
CLIENT_URL=http://localhost:5173
```

## Run

Start the API:

```bash
npm run dev --prefix server
```

Start the frontend:

```bash
npm run dev --prefix client
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Next Suggested Steps

- Add JWT auth controllers and routes
- Replace sample startup controllers with MongoDB-backed queries
- Add protected routes for dashboard and profile
- Implement CRUD flows for startups and applications
