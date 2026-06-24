# eBarrio Mobile App (Backend)

## Overview

The eBarrio mobile backend is built with Express.js and serves as the core API for the mobile application. It manages authentication, real-time Socket.IO communication with Redis, Firebase integration, and scheduled notifications for users.

## Tech stack

- Node.js
- Express
- MongoDB (Mongoose)
- Redis
- Socket.IO
- Firebase Admin
- bcryptjs, jsonwebtoken

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shadp11/eBarrio-System.git
cd eBarrio-System/mobile/ebarrio-mobile-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of the backend directory and configure the following:

```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
REDIS_URL=your_redis_url
SOCKET_CORS_ORIGIN=*
```

### 4. Run the server

```bash
npm run dev
```

> The server runs at `http://localhost:5000` by default.

## Frontend dependency

The mobile app in `mobile/ebarrio-mobile` should connect to this backend.

## Notes

- Make sure MongoDB and Redis are running before starting the server.
- Do not commit `.env` or any secret keys to version control.
