# Pica — Money, Made Personal

> *"Every rupee, noticed."*

A production-ready full-stack personal finance tracker with an editorial, journal-like design. Built with React Native (Expo) + Node.js/Express/MongoDB. Submitted for internship evaluation.

---

## What It Does

Pica turns expense tracking into a reading experience. Inspired by editorial design — warm paper textures, ink typography, a single decisive coral accent — every screen feels crafted and alive.

**Complete user journey:**

```
Cold launch
  → Splash screen (animated mark + tagline)
  → Onboarding (3 story slides, horizontal swipe)
  → Budget setup (drag slider + presets)
  → Login / Register
  → Dashboard (spending hero, animated budget bar, category breakdown)
  → Journal (expense list grouped Today / Yesterday / weekday)
  → Insights (7-day bar chart, week-over-week delta, top categories)
  → Profile (budget editing, settings, sign out)
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Mobile framework | React Native + Expo | 0.81.5 / ~54 |
| Animations | react-native-reanimated | ~4.1.1 |
| Navigation | React Navigation | v7 |
| Persistence | AsyncStorage | 2.2.0 |
| HTTP client | Axios | ^1.15 |
| Backend runtime | Node.js + Express | 18+ / v5 |
| Database | MongoDB + Mongoose | ^9.5 |
| Auth | JWT + bcryptjs | — |
| Build | EAS Build (Expo) | — |

---

## Project Structure

```
spendly/
├── mobile/                        # React Native app (Expo)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── SplashScreen.js        # Animated entry (mark + name + pulse)
│   │   │   ├── OnboardingScreen.js    # 3 story slides, parallax, dot progress
│   │   │   ├── BudgetSetupScreen.js   # Drag slider, preset chips, AsyncStorage
│   │   │   ├── LoginScreen.js         # OAuth buttons, staggered FadeInDown
│   │   │   ├── RegisterScreen.js      # Animated step indicator
│   │   │   ├── DashboardScreen.js     # Balance hero, animated budget bar
│   │   │   ├── ExpenseListScreen.js   # AnimatedFlatList, date groups
│   │   │   ├── AddEditExpenseScreen.js# Real custom numpad, blinking cursor
│   │   │   ├── InsightsScreen.js      # Bar chart, trends, story insight
│   │   │   └── ProfileScreen.js       # Budget edit, settings rows
│   │   ├── components/
│   │   │   ├── AnimatedCard.js        # AnimatedCard / AnimatedRow / PressablePill
│   │   │   ├── ExpenseCard.js         # Journal entry card + CategoryRow
│   │   │   ├── FormField.js           # Underline input field
│   │   │   ├── PrimaryButton.js       # Ink CTA button
│   │   │   └── StateView.js           # Loading / error / empty states
│   │   ├── context/
│   │   │   ├── AuthContext.js         # login / register / logout + JWT storage
│   │   │   └── ExpenseContext.js      # CRUD + fetch with error handling
│   │   ├── navigation/
│   │   │   └── RootNavigator.js       # Splash→Onboarding→Budget→Auth→App flow
│   │   ├── theme/
│   │   │   └── colors.js              # Editorial palette + getCategoryColor()
│   │   └── utils/
│   │       ├── formatters.js          # ₹ currency, date, relative date
│   │       └── validators.js          # Auth + expense validation
│   ├── App.js                         # Providers: Auth → Expense → Navigator
│   ├── app.json                       # Expo config: name, splash, APK settings
│   ├── eas.json                       # EAS build profiles (preview APK, prod AAB)
│   ├── babel.config.js                # Reanimated plugin (required)
│   └── package.json
│
└── backend/                       # REST API
    ├── src/
    │   ├── server.js                  # Entry: DB connect → seed demo → listen
    │   ├── app.js                     # Express: CORS, JSON, routes, error handlers
    │   ├── config/db.js               # Mongoose connection
    │   ├── models/
    │   │   ├── User.js                # name, email, passwordHash
    │   │   └── Expense.js             # amount, category, date, note, userId
    │   ├── routes/
    │   │   ├── authRoutes.js          # POST /register, POST /login
    │   │   └── expenseRoutes.js       # GET/POST/PUT/DELETE /expenses
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   └── expenseController.js
    │   ├── middleware/
    │   │   ├── authMiddleware.js      # JWT Bearer verification
    │   │   └── errorMiddleware.js     # 404 + global error handler
    │   └── utils/
    │       └── ensureDemoUser.js      # Seeds demo@pica.app on startup
    ├── tests/                         # Jest + Supertest + in-memory MongoDB
    └── package.json
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

`.env` contents:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pica
JWT_SECRET=change_this_to_a_long_random_secret
DEMO_EMAIL=demo@pica.app
DEMO_PASSWORD=Pica@12345
DEMO_NAME=Pica Demo
```

Start:

```bash
npm run dev       # Development (nodemon, hot reload)
npm start         # Production
```

Verify: `GET http://localhost:5000/api/health` → `{ "message": "API is healthy" }`

Run tests:

```bash
npm test
```

---

### 2. Mobile

```bash
cd mobile
npm install
```

**Configure the API URL.** Open `src/context/AuthContext.js` and `src/context/ExpenseContext.js` and set the base URL:

```js
// Android emulator (AVD):
const BASE_URL = "http://10.0.2.2:5000/api";

// Physical Android device (replace with your machine's LAN IP):
const BASE_URL = "http://192.168.x.x:5000/api";

// iOS simulator:
const BASE_URL = "http://localhost:5000/api";
```

Start dev server:

```bash
npm start
# Scan QR with Expo Go, or press 'a' for Android emulator
```

---

## Building an APK for a Physical Device

The project uses **EAS Build** — no Android Studio or local SDK required.

```bash
# Install EAS CLI (once)
npm install -g eas-cli

# Log into Expo account
eas login

# Build preview APK (installable .apk file)
cd mobile
eas build --platform android --profile preview
```

When the build completes, EAS provides a download link for the `.apk`. Install it directly on any Android device.

For production (Play Store `.aab`):

```bash
eas build --platform android --profile production
```

---

## API Reference

**Base URL:** `http://localhost:5000/api`

### Auth (public)

| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |

### Expenses (requires `Authorization: Bearer <token>`)

| Method | Route | Body | Description |
|---|---|---|---|
| GET | `/expenses` | — | All expenses for authenticated user |
| POST | `/expenses` | `{ amount, category, date, note }` | Create expense |
| PUT | `/expenses/:id` | `{ amount, category, date, note }` | Update expense |
| DELETE | `/expenses/:id` | — | Delete expense |
| GET | `/expenses/summary` | — | Category totals |

### Health

| Method | Route | Response |
|---|---|---|
| GET | `/health` | `{ message: "API is healthy" }` |

---

## Demo Account

A demo user is seeded automatically every time the backend starts:

```
Email:    demo@pica.app
Password: Pica@12345
```

Tap **"Try demo account"** on the login screen — no registration needed.

---

## Design System

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F4F0E8` | Page background (warm off-white) |
| `paper2` | `#EBE5D8` | Card / input surfaces |
| `ink` | `#1A1814` | Primary text, buttons |
| `ink2` | `#3A3530` | Secondary text |
| `ink3` | `#7A726A` | Muted text, labels |
| `coral` | `#E8553A` | The one accent — CTAs, highlights |
| `sage` | `#5A6B4A` | Transport, on-track indicator |
| `plum` | `#5E3A5C` | Shopping, entertainment |
| `rust` | `#A85C2E` | Bills, utilities |
| `gold` | `#B8893E` | Health & wellness |

**Animation:** All animations run on the UI thread via Reanimated 4 worklets — 60fps guaranteed even under JS thread load.

---

## Key Technical Decisions

### Why Context API over Redux?
For a single-user finance app with two domains (auth + expenses), Context is the right scope. Redux would add overhead with no benefit at this scale.

### Why a custom numpad instead of the system keyboard?
The HTML prototype specified a custom numpad. It provides consistent UX across Android/iOS, avoids keyboard layout shifts, and feels more like a purpose-built financial tool.

### Why no icon library?
All tab bar icons are pure React Native `View` components — no `@expo/vector-icons` used in the custom tab bar. This eliminates a font-loading dependency from the critical path.

### Why AsyncStorage for budget?
The monthly budget is a user preference, not transactional data. Storing it locally avoids an API round trip and works offline.

---

## Evaluation Criteria Coverage

| Criterion | Implementation |
|---|---|
| React Native component design | 10 screens, 5 reusable components, editorial design system |
| Navigation | Native stack + bottom tabs + auth-gated flow + modal presentation |
| State management | Context API (AuthContext, ExpenseContext), AsyncStorage for preferences |
| API integration | Axios, JWT Bearer auth, full CRUD, error handling with user-facing alerts |
| Animations | Reanimated 4: FadeInDown, ZoomIn, Layout.springify, withSpring, withSequence |
| Edge cases | Loading / error / empty states on every data screen, validation on all forms |
| Code readability | Feature-folder structure, single-responsibility components, no magic values |
| Production readiness | EAS build config, APK profile, .env.example, .gitignore, backend tests |

---

## Scripts

### Backend

```bash
npm run dev      # Start with nodemon (development)
npm start        # Start without nodemon (production)
npm test         # Run Jest test suite
```

### Mobile

```bash
npm start        # Start Expo dev server
npm run android  # Start + open Android
npm run ios      # Start + open iOS simulator
```

---

## Security Notes

- JWT secrets are environment variables — never hardcoded
- Passwords are hashed with bcryptjs (10 salt rounds) before storage
- All expense routes verify the JWT and scope queries to `req.user._id`
- `.env` is gitignored at both root and backend level
- No secrets are committed to the repository

---

*Built by Le Chakrawarthy — Pica v1.0*
