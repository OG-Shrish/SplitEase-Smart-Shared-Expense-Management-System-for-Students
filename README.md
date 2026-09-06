# SplitEase – Smart Shared Expense Management System for Students

SplitEase is a full-stack web application designed to help students, roommates, and small groups effortlessly manage shared expenses. Users can create groups, record expenses, automatically calculate who owes whom, and simplify debts with our optimization algorithm.

## Features
- **User Authentication**: Secure registration and login using JWT and bcrypt.
- **Group Management**: Create groups and invite friends.
- **Expense Tracking**: Add expenses with various split options (Equal, Custom Amount, Percentage).
- **Automatic Balances**: Automatically track personal net balances in each group.
- **Debt Simplification**: Advanced algorithm that matches creditors and debtors to minimize total transactions.
- **Settlement System**: Mark debts as settled to update balances instantly.
- **Analytics**: Basic spending visualization and insights.

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT.
- **DevOps**: Docker, Docker Compose.

## Project Structure
```
SplitEase/
├── client/          # Next.js frontend application
├── server/          # Node.js/Express backend
├── docker-compose.yml
└── README.md
```

## Running with Docker

The easiest way to run the application is using Docker.

1. Make sure you have Docker and Docker Compose installed.
2. In the root directory, run:
   ```bash
   docker compose up --build
   ```
3. The services will be available at:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Running Locally (Without Docker)

### Backend
1. `cd server`
2. `npm install`
3. Create a `.env` file or export environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`.
4. `npm run dev`

### Frontend
1. `cd client`
2. `npm install`
3. Create a `.env.local` file with `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
4. `npm run dev`

## API Overview
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/groups` - Create a group
- `POST /api/expenses` - Create an expense
- `GET /api/balances/group/:groupId/simplify` - Get simplified debts for settlement

## Contributors
- AI Assistant
