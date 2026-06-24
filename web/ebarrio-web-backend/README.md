# eBarrio Web App(Backend)

The eBarrio backend is built with Express.js and serves as the core API for the web application. It handles authentication, API routing, real-time communication through Socket.IO with Redis support, and integration with Firebase for storage services.

---

## Tech stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis
- Socket.IO
- Firebase Admin
- bcryptjs, jsonwebtoken

---

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

### 3. Environment Variables

Create a `.env` file in the root of the backend directory and configure the following:

```bash
PORT=5000
DATABASE_URL=your-mongodb-connection
ACCESS_SECRET=your-access-secret
REFRESH_SECRET=your-refresh-secret
REDIS_URL=your-redis-connection
GEMINI_API_KEY=your-gemini-key
SEMAPHORE_KEY=your-semaphore-key
```

### 4. Run the backend

```bash
npm run dev
```

> The server runs at `http://localhost:5000` by default.

---

## Frontend connection

The frontend client in `web/ebarrio-web` expects the backend at:

- HTTP API: `http://localhost:5000/api`
- Socket endpoint: `http://localhost:5000`

---

## Notes

- Do not commit `.env` or any secret keys to version control.
- The backend code loads Firebase credentials from `serviceAccountKey.json`.

---

## How to Use

### 1. Access the Application

After running both frontend and backend, go to: `http://localhost:3000`

### 2. Create the Initial User (Technical Admin)

- The system requires a **Technical Admin** account to manage barangay residents, households, employees, user accounts, and activity logs.
- Since passwords are encrypted using **bcrypt**, you cannot store or insert plain text passwords directly into the database.
- To create this account, you must manually insert a user into the database with a **bcrypt-hashed password**.

```json id="admin-json"
{
  "username": "your-username",
  "password": "your-bcrypt-hashed-password",
  "role": "Technical Admin",
  "mobileNumber": "your-mobile-number",
  "status": "Inactive"
}
```

> You can generate a bcrypt hash using an online bcrypt generator or a simple Node.js script.

### Example Command

```bash id="bcrypt-cmd"
node -e "console.log(require('bcrypt').hashSync('yourPassword', 10))"

```

### Login

- Use the credentials you created for Technical Admin.
- Once logged in, you can manage barangay residents, households, employees, user accounts, and activity logs.
