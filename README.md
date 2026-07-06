# CAP Predictor

A modern, high-performance web application designed to predict Maharashtra CAP (Centralized Admission Process) engineering college allotments using historical cutoff data (2023–2025). Built with a **React 19 + Vite** frontend and a highly optimized **Express + MongoDB** read-only backend API.

## Features & Architecture

* **Serverless User Data**: The application leverages your device's native `localStorage` for all personalized data (saved shortlists, option-entry forms). This guarantees complete privacy, lightning-fast interactions, and offline-persistence without requiring user accounts or logins.
* **Premium UI/UX**: Built with Tailwind CSS and Framer Motion for a stunning, glassmorphism-inspired dark mode interface that looks exceptional on both mobile devices and wide desktop displays.
* **Advanced Predictors**: 
  * **College Predictor (Forward)**: Classifies every college branch as **SAFE / MODERATE / REACH** using a recency-weighted trend projection over the final round of each year, plus a round-timing advisor.
  * **Target College (Reverse) Predictor**: Calculates the exact percentile you need to secure a specific seat based on your reservation category.
* **Smart Option Form Builder**: An interactive drag-and-drop builder to organize your chosen colleges by preference rank.
* **CAP Progress Dashboard**: Real-time tracking of the official MHT-CET CAP timeline, updated for the 2026-27 academic year.

## Repository Structure

```
cap-predictor-mern/
├── client/          # React 19 + Vite + Tailwind front-end
│   └── src/
│       ├── components/   # SearchForm, ResultCard, Layout, MobileNav…
│       ├── hooks/        # useShortlist, useOptionForm (100% localStorage)
│       ├── lib/          # DataContext + client prediction engine
│       ├── pages/        # Dashboard, CollegeExplorer, Predictor...
│       └── services/     # Axios API client
└── server/          # Express 5 + Mongoose Read-Only API
    └── src/
        ├── models/       # College, Meta (Read-only data)
        ├── routes/       # colleges, predictions, admin
        ├── services/     # server-side prediction engine
        └── seed.ts       # imports cutoffs.json into MongoDB
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongod` or MongoDB Atlas)

## Setup

```bash
# 1. Install dependencies (root installs client + server workspaces)
cd cap-predictor-mern
npm install

# 2. Configure the server environment
#    server/.env already exists; edit MONGODB_URI as needed.
#    See server/.env.example for the full list of variables.

# 3. Seed the database from the bundled cutoffs.json
#    (loads 384+ colleges and category map into MongoDB)
npm run seed

# 4. Run client + server together (client on :5175, API on :5000)
npm run dev
```

Open `http://localhost:5175` in your browser. The Vite dev server proxies `/api` to the Express server on port `5000`.

## Environment variables

**server/.env**

| Variable         | Default                                      | Purpose                     |
| ---------------- | -------------------------------------------- | --------------------------- |
| `PORT`           | `5000`                                       | API port                    |
| `MONGODB_URI`    | `mongodb://127.0.0.1:27017/cap-predictor`    | MongoDB connection string   |
| `CLIENT_URL`     | `http://localhost:5175`                      | CORS allow-origin           |

**client/.env** (optional — see `client/.env.example`)

| Variable       | Default                       | Purpose                              |
| -------------- | ----------------------------- | ------------------------------------ |
| `VITE_API_URL` | `http://localhost:5000/api`   | API base URL (only for prod builds)  |

## Key API endpoints

| Method | Path                          | Description                                  |
| ------ | ----------------------------- | -------------------------------------------- |
| GET    | `/api/colleges/all`           | Returns all colleges + historical cutoffs    |
| GET    | `/api/colleges/category-map`  | Decoded reservation-category map (dropdowns) |
| GET    | `/api/colleges/meta`          | Dataset aggregate counts                     |
| POST   | `/api/predictions`            | Forward prediction (safe/moderate/reach)     |
| POST   | `/api/predictions/reverse`    | Required percentile for a target seat        |
| POST   | `/api/admin/upload`           | Upload/merge cutoff data (admin)             |

*Note: User accounts, shortlists, and option forms are purely client-side local storage features and have no backend endpoints.*
