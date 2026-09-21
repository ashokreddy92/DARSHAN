# 🙏 DarshanEase — Online Temple Darshan & Ticket Booking Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

**DarshanEase** is a comprehensive, full-stack web application designed to simplify spiritual pilgrimages across sacred temples in India. It empowers devotees to explore temples, reserve special darshan slots, book poojas, make donations, and receive instant digital tickets and confirmation emails.

---

## 🌟 Key Features

### 🕉️ Devotee Portal
- **Temple Directory:** Browse major temples with high-resolution imagery, timings, historical significance, and available amenities.
- **Special Entry Darshan Booking:** Real-time slot availability, devotee quota management, and customizable pooja packages.
- **Digital Passes & Instant Receipts:** Automatically generated booking confirmation receipts with QR/booking identifiers.
- **Automated Email Notifications:** Fast transactional emails sent via Nodemailer SMTP with detailed itineraries and payment receipts.
- **Online Donations (Hundi):** Support sacred causes and temple welfare with instant receipts.
- **User Dashboard:** Dedicated **My Bookings** portal to track upcoming darshans, download passes, or cancel bookings.

### 🛡️ Admin & Organizer Dashboard
- **Temple Management:** Add, update, and manage temple details and media.
- **Slot Scheduling:** Configure darshan dates, time intervals, devotee limits, and ticket pricing.
- **Booking Verification:** Review devotee lists, check-in attendees, and track daily capacity.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Lucide React, React Toastify, Axios, EmailJS |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB ODM), Nodemailer, Multer, Cloudinary, JWT, Bcrypt |
| **Database** | MongoDB Atlas (Cloud Database) |
| **Deployment** | Render (Infrastructure-as-Code via `render.yaml`) |

---

## 📁 Project Structure

```text
ashokpro/
├── backend/                  # Express REST API
│   ├── config/               # Database & service configurations
│   ├── controllers/          # Request handlers (auth, bookings, temples, contact)
│   ├── middleware/           # JWT auth & role validation middleware
│   ├── models/               # Mongoose schemas (User, Temple, Booking, etc.)
│   ├── routes/               # Express API route endpoints
│   ├── utils/                # Helpers (emailHelper, token generators)
│   ├── seed.js               # Database seeding script with initial temple data
│   ├── server.js             # API entrypoint
│   └── package.json
│
├── frontend/                 # Vite + React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Footer, ProtectedRoute)
│   │   ├── context/          # Global state (AuthContext)
│   │   ├── pages/            # Page views (Home, Temples, BookDarshan, AdminDashboard, etc.)
│   │   ├── App.jsx           # Application routing & lazy-loaded views
│   │   ├── index.css         # Styling system
│   │   └── main.jsx          # Frontend entrypoint
│   ├── vite.config.js
│   └── package.json
│
├── render.yaml               # Render Infrastructure blueprint
├── package.json              # Monorepo root scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **MongoDB Atlas** database URI or a local MongoDB instance
- **Gmail Account** (with an App Password) or custom SMTP credentials for email delivery

---

### 1. Clone the Repository

```bash
git clone https://github.com/ashokreddy92/DARSHAN.git
cd DARSHAN
```

### 2. Install Dependencies

Install root, backend, and frontend dependencies in one command:

```bash
npm run install-all
```

---

### 3. Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email Delivery (Nodemailer SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password

# (Optional) Custom SMTP Provider (e.g. Mailjet, Elastic Email on port 2525)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=465

# (Optional) Cloudinary Media Uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend Configuration
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000

# (Optional) EmailJS client-side delivery
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

### 4. Seed Initial Temple Data (Optional)

Populate sample sacred temples, poojas, and darshan slots:

```bash
npm run seed
```

---

### 5. Run the Application Locally

Start both the backend and frontend simultaneously:

```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🌐 Cloud Deployment (Render)

This repository includes a [`render.yaml`](./render.yaml) configuration file for one-click deployment:

1. Connect your GitHub repository to [Render](https://render.com/).
2. Create a new **Blueprint** and point to your repository.
3. Render will provision:
   - **`darshanease-backend`** (Node.js Web Service)
   - **`darshanease-frontend`** (Static Site)
4. Add your private environment variables (`MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`) in the Render Dashboard under **Environment**.

> [!TIP]
> **Email Delivery on Cloud Platforms:** Standard cloud providers (like Render Free Tier) block standard SMTP port 465/587. You can configure EmailJS on the frontend or use an SMTP provider that supports port `2525` (such as Mailjet or Elastic Email) by setting `EMAIL_HOST` and `EMAIL_PORT=2525`.

---

## ⚡ Production-Grade Redis Architecture & Coordination Layer

DarshanEase integrates **Redis 7+** (via `ioredis`) as a dedicated high-throughput caching, rate-limiting, distributed locking, and real-time coordination layer.

> [!IMPORTANT]
> **MongoDB remains the primary source of truth** for all permanent records (Users, Bookings, Temples, Donations, Payments). Redis coordinates transient state and accelerates read/write concurrency.

```text
                    DARSHANEASE PLATFORM
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       Frontend (React)              Backend (Node.js)
              │                             │
              │                ┌────────────┴────────────┐
              │                ▼                         ▼
              │          MongoDB Atlas                Redis 7
              │       (Source of Truth)         (Performance Layer)
              │                │                         │
              │         Permanent Data:           Transient State:
              │         • Users & Profiles        • Email OTP Hashing
              │         • Temple Records          • Distributed Locks
              │         • Confirmed Bookings      • Cache-Aside (10m/1m)
              │         • Donation Receipts       • Multi-tier Rate Limits
              │                                   • Temporary Holds
              │                                   • Idempotency Keys
              │                                   • Pub/Sub Adapter
              └──────────────────────────────────────────┘
```

### 1. Redis Key Architecture (`utils/redisKeys.js`)
All keys strictly follow predictable namespaces:
| Purpose | Pattern | TTL |
| :--- | :--- | :--- |
| **Email OTP** | `darshanease:otp:{email}` | 5 minutes |
| **OTP Attempts** | `darshanease:otp:attempts:{email}` | 5 minutes (max 5) |
| **OTP Cooldown** | `darshanease:otp:cooldown:{email}` | 60 seconds |
| **Distributed Lock** | `darshanease:lock:booking:{slotId}` | 30 seconds |
| **Temporary Reservation** | `darshanease:reservation:{slotId}:{userId}` | 10 minutes |
| **Temple Details** | `darshanease:temple:{templeId}` | 15 minutes |
| **Temples List** | `darshanease:temples:list:{hash}` | 10 minutes |
| **Slot Availability** | `darshanease:slots:{templeId}:{date}` | 60 seconds |
| **Rate Limiter** | `darshanease:rate:{endpoint}:{identifier}` | Window (60s–15m) |
| **Idempotency** | `darshanease:idempotency:{key}` | 24 hours |
| **Token Revocation** | `darshanease:token:blacklist:{jwt}` | Remaining expiry |

---

### 2. Core Capabilities

- **Email OTP Authentication (`services/otpService.js`)**:
  - Secure 6-digit cryptographic OTP generation.
  - HMAC-SHA256 salted hashing — plaintext OTP is **never** stored in Redis or exposed in API responses.
  - 60-second anti-spam cooldown and max 5 attempts brute-force protection.
- **Distributed Booking Locks (`services/bookingLockService.js`)**:
  - Eliminates double-booking race conditions during high-demand festival rushes.
  - Atomic `SET key token NX EX 30` with unique UUID token per worker.
  - Safe release using atomic Lua script — preventing workers from accidentally clearing someone else's expired lock.
- **Cache-Aside Pattern (`services/cacheService.js`)**:
  - Automatic cache miss -> database fetch -> cache hit cycle.
  - Automatic pattern invalidation (`SCAN`) on slot booking, cancellation, or temple mutation.
- **Multi-Tier Rate Limiting (`middleware/rateLimiter.js`)**:
  - `send-otp`: 5 requests / 15m / email
  - `verify-otp`: 10 requests / 15m / IP
  - `bookings`: 10 requests / 1m / user
  - `donations`: 10 requests / 1m / user
- **Idempotency (`middleware/idempotency.js`)**:
  - Intercepts `Idempotency-Key` headers on `/api/bookings` and `/api/donations`.
  - Replays original response upon double-click or network retry without duplicating records.
- **Real-Time Scaling (`socket/socketService.js`)**:
  - Integrated `@socket.io/redis-adapter` for multi-instance horizontal scaling.

---

### 3. Docker Deployment (`docker-compose.yml`)

Run the entire platform (Frontend, Backend, MongoDB, Redis) with a single command:

```bash
docker compose up -d
```

Verify Redis container status:
```bash
docker compose exec redis redis-cli ping
# Expected: PONG
```

---

### 4. Running the Automated Redis Test Suite

The backend includes a comprehensive 24-point automated test suite:

```bash
cd backend
npm run test:redis
```

Covers:
- Primitive & JSON serialization
- HMAC-SHA256 Email OTP flow & cooldown enforcement
- Cache-aside hit/miss/invalidation
- Distributed lock contention & safe Lua release
- 50-worker simulated booking concurrency stress test
- Atomic rate limiting & 429 Retry-After headers
- Idempotency replay

---

### 5. Redis Troubleshooting & Common Errors

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:6379` | Local Redis service is stopped | Start Redis (`docker compose up -d redis` or Windows service) or set `REDIS_ENABLED=false` to use database fallback. |
| `READONLY You can't write against a read only replica` | Cluster failover event | The client automatically triggers reconnect on READONLY error. |
| Rate limit false positives | Reverse proxy IP sharing | Configure `trust proxy` or use Email/User ID rate limiting. |

---

## 🔒 Security Best Practices
- Passwords hashed using **bcryptjs** with salt rounds.
- Email OTP hashed using **HMAC-SHA256** with salted secrets.
- Stateless authentication using **JSON Web Tokens (JWT)** with Redis token revocation on logout.
- Sensitive environment files (`.env`) are strictly excluded from version control via `.gitignore`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
