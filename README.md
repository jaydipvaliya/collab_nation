# CollabNation

## 1. Project Description

CollabNation is a full-stack web platform that helps entrepreneurs, developers, designers, and innovators collaborate to build startup teams.

The platform allows users to:
- Share startup ideas
- Discover projects that need collaborators
- Apply to join startup teams
- Connect with people based on skills

The goal of CollabNation is to make it easier for people with ideas to find the right team and turn those ideas into real startups.

---

## 2. Features

- User authentication (register & login)
- User profiles with skills and portfolio
- Startup idea posting
- Apply to join startup teams
- Explore startup ideas
- Team dashboard for each startup
- Skill-based filtering
- Messaging between collaborators

---

## 3. Tech Stack

Frontend  
- React.js  
- Tailwind CSS  
- React Router  
- Axios  

Backend  
- Node.js  
- Express.js  
- JWT Authentication  

Database  
- MongoDB  
- Mongoose  

---

## 4. Project Structure

```
collabnation/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

---

## 5. Prerequisites

Make sure the following software is installed before running the project:

- Node.js (v18 or higher)
- npm or yarn
- MongoDB or MongoDB Atlas

---

## 6. Environment Variables

Create a `.env` file inside the **server** folder.

Example:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 7. Installation

Clone the repository:

```
git clone https://github.com/yourusername/collabnation.git
cd collabnation
```

Install backend dependencies:

```
npm install --prefix server
```

Install frontend dependencies:

```
npm install --prefix client
```

---

## 8. Run the Project

Start the backend server:

```
npm run dev --prefix server
```

Start the frontend:

```
npm start --prefix client
```

Application will run on:

Frontend  
```
http://localhost:3000
```

Backend API  
```
http://localhost:5000
```

---

## 9. Scripts

Available project commands:

```
npm run dev
npm run start
npm run build
```

---

## 10. App Routes

Public Routes

```
/
login
register
explore-startups
```

User Routes

```
dashboard
create-startup
profile
applications
```

---

## 11. API Endpoints

Authentication

```
POST /api/auth/register
POST /api/auth/login
```

Users

```
GET /api/users/:id
PUT /api/users/:id
```

Startups

```
POST /api/startups
GET /api/startups
GET /api/startups/:id
```

Applications

```
POST /api/apply
GET /api/applications
```

---

## 12. Security Notes

- Do not commit `.env` files
- Keep API keys private
- Use `.env.example` for variable templates
- Validate all user inputs

---

## 13. Deployment

Frontend  
- Vercel / Netlify

Backend  
- Render / Railway

Database  
- MongoDB Atlas

---

## Summary

CollabNation is a MERN stack application that helps innovators connect, collaborate, and build startup teams together.

This project demonstrates:

- Full-stack MERN development
- Authentication systems
- REST API design
- Database relationships
- Collaboration platform architecture
