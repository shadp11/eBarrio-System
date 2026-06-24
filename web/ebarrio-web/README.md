# eBarrio Web App (Frontend)

## Overview

The eBarrio web frontend is built with React and provides the user interface for barangay administration. It supports resident management, document processing, announcements, disaster alerts, and real-time notifications.

## Features

- Resident, employee, and household management
- Document request processing and tracking
- Announcement and notification system
- Real-time alerts and updates
- AI-powered analytics for data insights and reporting
- User authentication and role-based access control
- Responsive and user-friendly web interface
- Tailwind CSS for modern UI design

## Tech stack

- React
- JavaScript
- Axios
- React Router
- Tailwind CSS
- Socket.IO client

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shadp11/eBarrio-System.git
cd eBarrio-System/web/ebarrio-web
```

### 2. Install Dependencies

```bash
npm install
```

### Start the App

```bash
npm start
```

> The frontend runs at `http://localhost:3000` by default.

## Backend dependency

This frontend is configured to use the backend API at `http://localhost:5000/api` and the socket server at `http://localhost:5000`.

Start the backend separately from `web/ebarrio-web-backend` before using the frontend.

## Project structure

- `src/` — React source files
- `public/` — static public assets
- `package.json` — dependencies and scripts

## Notes

- The frontend currently uses fixed backend URLs in `src/api.js` and `src/context/SocketContext.js`.
- If the backend host changes, update these URLs accordingly.
- The app uses `react-scripts`, so `npm start` launches the Create React App development server.

**Link to project:** https://ebarrio.online

<p align="center">
  <img alt="image" src="https://github.com/user-attachments/assets/fc3e51f7-4eab-486f-ad8d-30c26bfb6e33" width="45%" />
  <img alt="image" src="https://github.com/user-attachments/assets/401bd291-7e3a-458e-bf66-23803a1e7b41" width="45%" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/a1b2d721-856f-42b3-973d-15221bf884d3" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/bb6deb56-5af3-46ac-88a0-22e16cb19025" />
  <img width="45%" alt="image" src="https://github.com/user-attachments/assets/2eba703d-9a2b-48bf-b715-f99d9d6db66e" />
  <img width="45%"  alt="image" src="https://github.com/user-attachments/assets/13f746a8-e653-4bae-a37d-e17786bc1c14" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/ca2483cc-07a2-4299-9e6d-bea6e6787f3a" />
  <img  width="45%"  alt="image" src="https://github.com/user-attachments/assets/4aefabcf-0b1e-4fb8-834d-d6250a4ad1cc" />
  <img width="45% alt="image" src="https://github.com/user-attachments/assets/6aed44e2-f56d-41c3-8f9e-2700d44577b9" />
  <img width="45% alt="image" src="https://github.com/user-attachments/assets/e79d3bab-41f2-406a-b4bd-eb557c6219da" />
  <img width="45%" alt="image" src="https://github.com/user-attachments/assets/4ed90a86-03b7-4ac2-9247-644cdecc75f0" />
  <img width="45%" alt="image" src="https://github.com/user-attachments/assets/bb9212fc-efc6-4617-8b69-58c567702607" />
</p>
