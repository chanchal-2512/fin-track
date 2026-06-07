# FinTrack – Personal Finance Tracker

A full-stack personal finance tracker with React frontend, Node.js backend, and JSON file storage.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, react-hot-toast |
| Backend | Node.js, Express |
| Storage | JSON files (no database) |

## Features

- ✅ Add / Edit / Delete expenses with categories
- ✅ Set monthly budgets per category with progress tracking
- ✅ Dashboard with daily spending chart & category pie
- ✅ Monthly reports: daily line chart, category breakdown, top 5 expenses
- ✅ Yearly reports: 12-month bar chart, category totals
- ✅ Filter expenses by month, year, category
- ✅ Budget alerts (over-budget warnings)
- ✅ INR currency formatting

## Project Structure

```
finance-tracker/
├── backend/
│   ├── server.js          # Express entry point
│   ├── routes/
│   │   ├── expenses.js    # CRUD for expenses
│   │   ├── budgets.js     # Budget management
│   │   └── reports.js     # Monthly & yearly reports
│   ├── utils/
│   │   └── storage.js     # JSON file read/write helpers
│   ├── data/              # Auto-created, stores JSON files
│   │   ├── expenses.json
│   │   └── budgets.json
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js          # Layout + routing
    │   ├── App.css         # Dark industrial theme
    │   ├── index.js
    │   ├── pages/
    │   │   ├── Dashboard.js
    │   │   ├── Expenses.js
    │   │   ├── Budgets.js
    │   │   └── Reports.js
    │   └── utils/
    │       ├── api.js       # All API calls
    │       └── constants.js # Categories, colors, formatters
    └── package.json
```

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
npm run dev      # dev with nodemon
# OR
npm start        # production
```

Backend runs on **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in frontend `package.json` proxies all `/api` requests automatically.

## API Endpoints

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all (filter: `?month=&year=&category=`) |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/meta/categories` | List unique categories |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets?month=&year=` | Get budgets with spending |
| POST | `/api/budgets` | Set/update a category budget |
| DELETE | `/api/budgets` | Remove a category budget |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/monthly?month=&year=` | Monthly report |
| GET | `/api/reports/yearly?year=` | Yearly overview |

## Data Storage

All data is stored in `backend/data/` as JSON files:
- `expenses.json` – array of expense objects
- `budgets.json` – nested object `{ "YYYY-MM": { "Category": limit } }`
