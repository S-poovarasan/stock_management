# Stock Management System

A full-stack stock management application with billing integration, split into separate **backend** and **frontend** projects.

## Project Structure

```
stock-management/
├── backend/          # Spring Boot REST API
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/stockmanagement/
│           └── resources/
├── frontend/         # Vanilla JS frontend
│   ├── package.json
│   └── public/
│       ├── css/
│       ├── js/
│       ├── index.html
│       ├── login.html
│       ├── stock.html
│       └── billing.html
├── run-backend.bat
├── run-frontend.bat
└── run.bat           # Starts both
```

## Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 16+** and npm

## Quick Start

### Start everything at once
```bash
run.bat
```

### Start individually

**Backend** (Spring Boot API on port 8080):
```bash
cd backend
mvn spring-boot:run
```

**Frontend** (Dev server on port 3000):
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

- **Username:** admin
- **Password:** admin123

## Features

### Authentication
- JWT-based secure login

### Stock Management
- Add/edit products (SKU, category, prices)
- Stock IN/OUT/ADJUSTMENT transactions
- Low stock alerts
- Product search

### Billing
- Multi-item bills with automatic stock deduction
- Tax and discount support
- Cash, Card, UPI, Bank Transfer payment methods
- Bill history

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security + JWT
- H2 (dev) / MySQL (prod)
- Lombok

### Frontend
- HTML5 / CSS3 / Vanilla JS
- Fetch API for REST calls
- live-server for development

## API Base URL

Backend: `http://localhost:8080/api`
Frontend: `http://localhost:3000`
