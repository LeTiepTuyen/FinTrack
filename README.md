# FinTrack - Personal Finance Management Platform

A full-stack finance management project built with Vue 3 + Vite (frontend) and Laravel-style backend architecture.

![Vue](https://img.shields.io/badge/vue-3.5.20-42b883.svg)
![Vite](https://img.shields.io/badge/vite-5.4.x-646cff.svg)
![Node.js](https://img.shields.io/badge/node.js-backend-green.svg)
![Express](https://img.shields.io/badge/express-api-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/mongodb-database-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

FinTrack helps users track income and expenses, monitor balances, plan budgets, and manage saving goals.

Current repository status:
- Frontend is runnable and includes marketing pages, login, dashboard, and transaction ledger.
- Backend is built with Node.js, Express, and MongoDB to serve API endpoints.

## Team Members

| Name | Student ID | Role |
|------|------------|------|
| Le Tiep Tuyen | 22020015 | Team Lead & Developer |
| Mai Thieu Tin | 22020003 | Developer |
| Doan Hong Ngoc | 22020010 | Developer |

## Core Features

### Implemented in frontend
- Multi-layout website (marketing, auth, app workspace)
- Login screen with simple local validation flow
- Dashboard with balance/income/expense cards
- Weekly cash-flow visualization
- Transaction ledger with filters and quick add form
- Blog and feature pages for product presentation

### Implemented in backend scaffold
- Transaction CRUD controller scaffold
- Domain models for core finance modules
- Extended schema for users, wallets, categories, budgets, saving goals, and recurring transactions

## Technology Stack

- Frontend: Vue 3, Vue Router, Pinia, Axios, Vite
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB Atlas

## Project Structure

```
HCI-FinTrack/
|-- backend/
|   |-- controllers/
|   |   `-- transactionController.js
|   |-- models/
|   |   `-- Transaction.js
|   |-- routes/
|   |   `-- transactionRoutes.js
|   |-- .env
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- public/references/
|   |-- src/
|   |   |-- assets/base.css
|   |   |-- router/index.js
|   |   |-- services/api.js
|   |   |-- stores/financeStore.js
|   |   `-- views/
|   |       |-- HomeView.vue
|   |       |-- FeaturesView.vue
|   |       |-- BlogView.vue
|   |       |-- LoginView.vue
|   |       |-- DashboardView.vue
|   |       `-- TransactionsView.vue
|   |-- package.json
|   `-- vite.config.js
|-- .gitignore
`-- README.md
```

## Frontend Quick Start

### Prerequisites
- Node.js 20+

### Install and run

```bash
cd frontend
npm install
npm run dev
```

App URLs:
- Marketing pages: `http://localhost:5173/`
- Login: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/app`
- Transactions: `http://localhost:5173/app/transactions`

### Build

```bash
cd frontend
npm run build
```

## Backend Status and Notes

The backend directory has been completely migrated to Node.js (Express) with MongoDB connection.

### Run Backend

```bash
cd backend
npm install
npm run dev
```

The API will start running at `http://localhost:8000/api`.

## Database Schema Modules

![FinTrack Database Schema](Fintrack-database-schema-design.png)

Defined in [DATABASE.md](DATABASE.md) and model files:

- users
- wallets
- categories
- transactions
- budgets
- saving_goals
- goal_contributions
- recurring_transactions

Schema highlights:
- Transaction table supports legacy `category` text plus normalized `category_id`
- Support for manual/import/recurring transaction sources
- Budget and savings goal planning is modeled for monthly and long-term tracking

## API Scaffold (Current)

Currently defined endpoint group:
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/{id}`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`

## Roadmap

1. Add controllers/resources for wallets, categories, budgets, saving goals
2. Add authentication (JWT)
3. Add recurring transaction scheduler
4. Add reporting APIs and chart endpoints
5. Add test suites for frontend and backend

## License

MIT License
