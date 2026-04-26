# Spendly - Expense Tracker App

Full-stack expense tracker built with:
- React Native (Expo)
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Features

- JWT auth (register/login)
- Expense CRUD: add, edit, delete, list
- Dashboard category summary from real expense data via `expenses.reduce()`
- Loading, error, and empty states across screens
- Context API state management (`AuthContext`, `ExpenseContext`)
- Auth-gated navigation using React Navigation

## Project Structure

- `backend/` - Express REST API + MongoDB models + tests
- `mobile/` - Expo React Native app

## Backend Setup (Do This First)

1. Go to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` from `.env.example` and update values:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/spendly
JWT_SECRET=your_super_secret_key
```

4. Run API in dev mode:
```bash
npm run dev
```

5. Verify backend with tests:
```bash
npm test
```

API base URL: `http://localhost:5000/api`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Expenses (Bearer token required)
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `GET /api/expenses/summary`

## Postman Test Order (Recommended)

1. Register user (`POST /api/auth/register`)
2. Login user (`POST /api/auth/login`)
3. Copy JWT token
4. Add expense (`POST /api/expenses`) with `Authorization: Bearer <token>`
5. List expenses (`GET /api/expenses`)
6. Update one expense (`PUT /api/expenses/:id`)
7. Fetch summary (`GET /api/expenses/summary`)
8. Delete expense (`DELETE /api/expenses/:id`)

## Mobile Setup

1. Go to mobile folder:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/api/client.js` if needed:
- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator: `http://localhost:5000/api`
- Physical device: `http://<your-local-ip>:5000/api`

4. Start Expo:
```bash
npm start
```

## Frontend Flow (Implemented)

1. Login screen
2. Register screen
3. Add/Edit Expense screen
4. Expense List screen
5. Dashboard screen (category totals from actual data)

## Evaluation Criteria Coverage

1. React Native component design & navigation
- Native stack + bottom tabs + auth guard routing

2. State management
- Context API for auth and expense data

3. API integration and async handling
- Axios client + async context actions + retries and alerts

4. Edge cases and validation
- Input validation on auth and expense forms
- Empty list/dashboard states
- Visible loading/error states

5. Code readability and structure
- Modular folders: `api`, `context`, `navigation`, `screens`, `components`, `theme`, `utils`

## Scripts

### Backend
- `npm run dev`
- `npm run start`
- `npm test`

### Mobile
- `npm start`
- `npm run android`
- `npm run ios`
- `npm run web`
