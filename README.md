# FinTrack - Personal Finance Management Platform

A full-stack finance management project built with **Vue 3 + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

![Vue](https://img.shields.io/badge/vue-3.5.20-42b883.svg)
![Vite](https://img.shields.io/badge/vite-5.4.x-646cff.svg)
![Node.js](https://img.shields.io/badge/node.js-backend-green.svg)
![Express](https://img.shields.io/badge/express-api-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/mongodb-database-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

FinTrack helps users track income and expenses, monitor balances, plan monthly budgets, and get financial insights through an AI-powered assistant simulation.

### Current Status
- **Backend**: Fully migrated from Laravel to Node.js/MongoDB. Implements JWT authentication and robust data isolation.
- **Frontend**: Single Page Application (SPA) with multiple dashboards, transaction management, and real-time visualization.

## Team Members

| Name | Student ID | Role |
|------|------------|------|
| Le Tiep Tuyen | 22020015 | Team Lead & Developer |
| Mai Thieu Tin | 22020003 | Developer |
| Doan Hong Ngoc | 22020010 | Developer |

## Core Features

### 💰 Financial Management
- **Transaction Ledger**: Track income and expenses with detailed notes, categories, and dates. Includes server-side pagination and advanced filtering.
- **Monthly Budgets**: Set spending limits per category and monitor progress with visual indicators.
- **Real-time Analytics**: Dashboard with balance summaries, weekly cash flow charts, and category-based spending breakdown (Donut Chart).
- **Data Export**: Export your transaction history to CSV for external analysis.

### 🤖 Smart Features
- **AI Assistant (Simulation)**: A virtual consultant to help analyze your spending habits and provide financial tips.
- **Profile & Security**: Manage your personal information and update your password securely.

### 🔐 Authentication & Security
- **Secure Login**: JWT-based authentication system.
- **Data Isolation**: Users can only access and manage their own financial data.

## Technology Stack

- **Frontend**: Vue 3 (Composition API), Vue Router, Pinia, Axios, Vite.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB (Local or Atlas).

## Project Structure

```
HCI-FinTrack/
|-- backend/
|   |-- controllers/       # Auth, Transaction, Budget logic
|   |-- middleware/        # JWT Protection
|   |-- models/            # Mongoose Schemas (User, Transaction, Budget)
|   |-- routes/            # API Route definitions
|   |-- server.js          # Entry point
|   `-- .env               # Environment variables
|-- frontend/
|   |-- src/
|   |   |-- services/api.js      # Axios configuration
|   |   |-- stores/              # Pinia (auth, finance)
|   |   |-- views/               # Pages (Dashboard, Transactions, Budgets, AI, etc.)
|   |   `-- assets/base.css      # Core Design System
|-- DATABASE.md            # Detailed DB Documentation & ER Diagram
`-- README.md
```

## Quick Start

### 1. Prerequisites
- Node.js 20+
- MongoDB installed and running locally

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with MONGODB_URI and JWT_SECRET
npm run dev
```
*API will run at `http://localhost:8000/api`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*App will run at `http://localhost:5173`*

## Database Documentation

For a detailed look at the collection structures and entity relationships, please refer to:
👉 **[DATABASE.md](DATABASE.md)**

---

## License
MIT License
