# HunarHub – Digital Marketplace for Local Micro-Entrepreneurs 🛍️🎨

HunarHub is an end-to-end full-stack MERN (MongoDB, Express, React, Node.js) web application designed to empower local artisans, craftsmen, tailors, weavers, and rural/urban micro-entrepreneurs. It provides a direct digital marketplace where artisans can showcase handcrafted products, offer skilled on-demand services, manage customer bookings, and receive direct payments without middleman exploitation.

---

## 🌟 Key Features

### 👤 Role-Based Portals & Authentication
- **Multi-Role Access**: Customer/Buyer, Micro-Entrepreneur (Artisan), and Platform Administrator.
- **JWT Authentication & bcrypt Security**: Password hashing, token management in local storage & state.
- **Verified Artisan Badges**: Admin auditing workflow to grant verification badges to genuine local creators.

### 🛍️ Customer / Buyer Features
- **Artisan Marketplace**: Browse handcrafted goods with real-time category, price, search, and sorting filters.
- **On-Demand Skilled Services**: Book local tailoring, pottery workshops, home repairs, embroidery, and beauty services.
- **Artisan Directory & Storefronts**: Explore individual micro-entrepreneur bios, craft heritage, products, and reviews.
- **Cart & Checkout Flow**: Full cart management, direct delivery fee calculation, multi-payment options (UPI / Cards / COD simulation).
- **Interactive Reviews & Ratings**: Submit ratings and feedback for products and artisans.
- **Customer Dashboard**: Track order history, service booking status, and active support tickets.

### 💼 Micro-Entrepreneur Features
- **Storefront Management**: Add, update, and manage product inventory and service offerings.
- **Order Fulfillment**: Track incoming customer orders and update status (`shipped`, `delivered`).
- **Service Appointment Handling**: Accept, decline, or mark completed for incoming service bookings.
- **Earnings & Analytics Overview**: View gross earnings, active listings count, and order statistics.

### 🛡️ Platform Admin Dashboard
- **Entrepreneur Verification**: Audit and approve pending micro-entrepreneur applications.
- **User Governance**: Suspend or activate user accounts to maintain platform trust.
- **Grievance & Dispute Resolution**: View and resolve customer support tickets and complaints.
- **Platform Analytics**: High-level metrics on total users, verified entrepreneurs, and gross volume.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Lucide Icons, Zustand (State Management), React Hook Form, Zod.
- **Backend**: Node.js, Express.js, RESTful API architecture, JWT Middleware, Express Validator.
- **Database**: MongoDB with Mongoose ORM models (User, Product, Service, Order, ServiceRequest, Review, Notification, Complaint, Category).
- **Testing**: Jest & Supertest (Backend API tests), Vitest (Frontend unit tests), MongoMemoryServer (In-memory DB test server).
- **Containerization & DevOps**: Docker & Docker Compose setup, Nginx reverse proxy configuration.

---

## 📁 Repository Folder Structure

```
HunarHub/
├── client/                     # Frontend React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Layout, UI components (Navbar, Footer, Sidebar, Modals)
│   │   ├── pages/              # Views (Home, Marketplace, Services, Dashboards, Storefronts)
│   │   ├── services/           # Axios API service client
│   │   ├── store/              # Zustand global state (Auth, Cart, Notifications)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # React Router navigation & protected routes
│   │   └── main.tsx            # Application entry point
│   ├── Dockerfile              # Multi-stage production build + Nginx
│   └── nginx.conf              # Nginx reverse proxy routing
│
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/             # DB & JWT configurations
│   │   ├── controllers/        # Business logic handlers
│   │   ├── middleware/         # Auth, Role guards, Error handling
│   │   ├── models/             # Mongoose schemas (User, Product, Service, Order, etc.)
│   │   ├── routes/             # Express API endpoints
│   │   ├── seed/               # Database seeder script
│   │   └── tests/              # Jest API test suite
│   └── Dockerfile              # Node.js backend container
│
├── docker-compose.yml          # Full-stack orchestration
├── package.json                # Monorepo scripts
├── .gitignore                  # Git tracking rules
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas connection string)
- npm or yarn

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/your-username/HunarHub.git
cd HunarHub
npm run install:all
```

### 3. Environment Setup
Copy `.env.example` to `.env` in the `server` directory and adjust configurations:
```bash
# server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hunarhub
JWT_SECRET=hunarhub_super_secret_key_2026_jwt_token_auth
NODE_ENV=development
```

### 4. Seed Initial Data
Populate the database with demo users, categories, products, services, orders, and reviews:
```bash
npm run seed
```

### 5. Running the Application

#### Concurrent Development Mode (Frontend + Backend)
```bash
npm run dev
```

#### Run Backend Server Only
```bash
npm run server
# API available at http://localhost:5000/api
```

#### Run Frontend Client Only
```bash
npm run client
# Client available at http://localhost:5173
```

---

## 🧪 Testing Commands

#### Run Backend Jest API Test Suite
```bash
npm run test:server
```

#### Run Frontend Vitest Unit Test Suite
```bash
npm run test:client
```

#### Run All Test Suites
```bash
npm test
```

---

## 🏗️ Production Build Instructions

#### Build Frontend Application
```bash
npm run build
```
The compiled SPA production bundle will be generated in `client/dist`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hunarhub.local` | `Admin@12345` |
| **Entrepreneur** | `entrepreneur@hunarhub.local` | `Entrepreneur@12345` |
| **Customer** | `customer@hunarhub.local` | `Customer@12345` |

---

## 🐳 Docker Deployment

To run the entire application stack (MongoDB + Server + Client Nginx) via Docker:
```bash
docker-compose up --build
```
Access the application at `http://localhost`.

---

## 📜 License
This project is licensed under the MIT License.
