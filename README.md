# eBarrio System

## 📌 Overview

The eBarrio System is a full-stack, multi-platform application designed to improve barangay services and strengthen disaster preparedness. It is built as an integrated system consisting of web and mobile applications supported by separate backend services.

The system is divided into four main components:

- Web Application (Frontend)
- Web Backend (API)
- Mobile Application (Frontend)
- Mobile Backend (API)

Each module is developed independently but works together to deliver a complete and unified barangay management system.

---

## 🧱 Project Structure

/mobile
├── ebarrio-mobile
└── ebarrio-mobile-backend

/web
├── ebarrio-web
└── ebarrio-web-backend

---

## ⚙️ Tech Stack

### 📱 Mobile Application

- React Native (Expo)
- Axios (API requests)
- Socket.IO Client (real-time communication)
- Firebase (authentication, notifications, storage)

### 💻 Web Application (Frontend)

- React
- Tailwind CSS
- Axios
- Socket.IO Client
- React Router

### 🖥️ Backend (Web & Mobile APIs)

- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis
- Socket.IO
- Firebase Admin SDK
- REST API
- bcryptjs
- jsonwebtoken

---

## 📌 Notes

- Each project runs independently
- Environment variables are required (.env)
- Node modules are excluded from GitHub
