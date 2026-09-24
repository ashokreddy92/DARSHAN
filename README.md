# 🙏 DarshanEase — Online Temple Darshan & Ticket Booking Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-AMQP-orange.svg)](https://www.rabbitmq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

**DarshanEase** is an enterprise-grade, full-stack digital pilgrimage and temple management platform designed to streamline sacred darshan slot reservations, pooja bookings, donations, and gate entry verification across major Hindu temples in India.

The platform provides a seamless experience for **Devotees**, **Temple Organizers**, **Gate Staff**, and **Super Administrators** through real-time queueing, distributed locking, QR verification, automated email itineraries, and multi-language support.

---

## 📑 Table of Contents

1. [Key Features](#-key-features)
2. [Tech Stack](#-tech-stack)
3. [Deep Project Structure & File Analysis](#-deep-project-structure--file-analysis)
   - [Backend Architecture (`/backend`)](#1-backend-architecture-backend)
   - [Frontend Architecture (`/frontend`)](#2-frontend-architecture-frontend)
4. [System Architecture & Data Flow](#-system-architecture--data-flow)
5. [Getting Started & Installation](#-getting-started--installation)
6. [Environment Variables](#-environment-variables)
7. [Redis Caching, Concurrency & Rate Limiting](#-redis-caching-concurrency--rate-limiting)
8. [RabbitMQ Asynchronous Task Queues](#-rabbitmq-asynchronous-task-queues)
9. [Real-time Gate Verification & QR Scanner](#-real-time-gate-verification--qr-scanner)
10. [Multi-Language Internationalization (i18n)](#-multi-language-internationalization-i18n)
11. [Cloud Deployment (Render)](#-cloud-deployment-render)
12. [License](#-license)

---

## 🌟 Key Features

### 🕉️ Devotee Features
* **Interactive Temple Directory:** Explore 99+ premier Indian temples with detailed descriptions, deity information, daily opening hours, and direct high-res imagery.
* **Smart Darshan Slot Booking:** Real-time quota availability check for General, VIP, and Special Pooja slots across 7-day rolling windows.
* **Instant Digital Passes:** Automatically generated tickets equipped with secure QR codes, booking reference IDs, and downloadable PDF receipts.
* **Automated Email Itineraries:** Asynchronous email notifications sent via RabbitMQ background queues containing pass details and payment receipts.
* **Online Hundi & Cause Donations:** Secure online donations for Annadanam (free food), temple maintenance, and special festivals with downloadable digital receipts.
* **My Bookings Dashboard:** Devotee control panel to track upcoming darshans, display mobile QR passes for scanning, or cancel bookings.

### 🏛️ Organizer & Staff Features
* **Organizer Control Center:** Configure temple schedules, daily visitor quotas, VIP/Special slot pricing, and view daily earnings.
* **Gate Staff QR Scanner:** Mobile-friendly camera scanner to verify devotee QR passes in real time, preventing duplicate entry and unauthorized access.
* **Ground Incident Reporting:** Live logging of crowd surges, gate issues, or emergency incidents directly to administrators.

### 🛡️ Admin Dashboard & Analytics
* **Executive Overview:** Interactive charts (Recharts) displaying total revenue, visitor trends, slot utilization rates, and daily check-in counts.
* **Role-Based Access Control (RBAC):** Granular authorization for `USER`, `ORGANIZER`, `TEMPLE_STAFF`, and `ADMIN`.
* **Audit Logging & Security Controls:** Complete tracking of administrative mutations, payment attempts, and rate limit triggers.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router v7, Tailwind CSS, Lucide React, Recharts, i18next, HTML5 QR Scanner |
| **Backend API** | Node.js (v18+), Express.js 4.19, Mongoose 8 (MongoDB ODM), Socket.io 4, JWT, BcryptJS |
| **Database** | MongoDB Atlas (Production Data Store) |
| **Caching & Locking** | Redis 7+ (`ioredis`) for Cache-Aside, Distributed Locking (`SET EX NX`), Idempotency & Rate Limiting |
| **Message Broker** | RabbitMQ (AMQP) for async task queues (Email delivery, Payment processing, Analytics) |
| **Payments & Uploads** | Razorpay / Stripe integration, Cloudinary / Multer image storage |
| **Deployment & Hosting** | Render Blueprint (`render.yaml`), Node.js Web Service, Static Site |

---

## 📁 Deep Project Structure & File Analysis

```text
DarshanEase/
├── backend/                        # Node.js & Express REST API Server
│   ├── config/                     # System Configurations
│   │   ├── db.js                   # MongoDB connection logic with DNS failover
│   │   ├── redis.js                # Redis client connection and event listeners
│   │   └── socket.js               # Socket.io server initialization
│   ├── controllers/                # Business Logic & API Handlers
│   │   ├── authController.js       # Register, Login, JWT issuing, OTP validation
│   │   ├── bookingController.js    # Darshan reservation, lock checking, QR token generation
│   │   ├── contactController.js    # Contact form processing & email dispatch
│   │   ├── deityController.js      # CRUD operations for temple deities
│   │   ├── donationController.js   # Processing hundi contributions & receipt creation
│   │   ├── slotController.js       # Slot generation, availability checks & capacity update
│   │   ├── staffController.js      # QR ticket scanner verification & check-in handling
│   │   ├── templeController.js     # Temple directory searching, filtering & creation
│   │   └── userController.js       # Devotee profile management & password updates
│   ├── data/                       # Static Data Sets
│   │   └── templesData.js          # Master dataset of 99+ Indian temples with image URLs
│   ├── middleware/                 # Middleware Layers
│   │   ├── authMiddleware.js       # JWT header extraction & user validation
│   │   ├── roleMiddleware.js       # RBAC authorization (ADMIN, ORGANIZER, STAFF, USER)
│   │   ├── rateLimiter.js          # Multi-tier Redis sliding-window rate limiters
│   │   ├── idempotency.js          # Double-submission protection using Redis key locks
│   │   └── upload.js               # Multer image upload handling
│   ├── models/                     # Mongoose Schemas
│   │   ├── User.js                 # Devotees, Staff, Organizers, Admin accounts
│   │   ├── Temple.js               # Temple metadata, city, state, hours, image links
│   │   ├── DarshanSlot.js          # Date, time window, capacity, price, slot type
│   │   ├── Booking.js              # Reserved passes, devotee lists, QR tokens, status
│   │   ├── Donation.js             # Financial contributions and transaction references
│   │   ├── Payment.js              # Payment gateway transactions & refund records
│   │   ├── PaymentAuditLog.js      # Gateway webhook logs & payment audit trails
│   │   ├── OTP.js                  # Short-lived email authentication OTP codes
│   │   ├── Incident.js             # Ground incident logs reported by temple staff
│   │   └── AdminAuditLog.js        # System audit trail for administrative changes
│   ├── queues/                     # RabbitMQ Producers
│   │   ├── emailQueue.js           # Enqueues transactional email notifications
│   │   ├── bookingQueue.js         # Enqueues async booking notifications
│   │   ├── paymentQueue.js         # Enqueues payment status verification jobs
│   │   ├── notificationQueue.js    # Enqueues socket real-time alerts
│   │   └── analyticsQueue.js       # Enqueues system usage logging events
│   ├── routes/                     # Express Router Mountpoints
│   │   ├── adminRoutes.js          # `/api/admin` - Executive dashboard endpoints
│   │   ├── authRoutes.js           # `/api/auth` - Login, Register, OTP verification
│   │   ├── bookingRoutes.js        # `/api/bookings` - Create, view & cancel passes
│   │   ├── contactRoutes.js        # `/api/contact` - User feedback and inquiries
│   │   ├── deityRoutes.js          # `/api/deities` - Deity directory endpoints
│   │   ├── donationRoutes.js       # `/api/donations` - Online hundi payments
│   │   ├── paymentRoutes.js        # `/api/payments` - Gateway checkout & webhooks
│   │   ├── slotRoutes.js           # `/api/slots` - Slot availability & creation
│   │   ├── staffRoutes.js          # `/api/staff` - QR ticket check-in verification
│   │   ├── templeRoutes.js         # `/api/temples` - Public temple list & search
│   │   └── uploadRoutes.js         # `/api/upload` - File and media upload handler
│   ├── scripts/                    # Maintenance & Seeding Scripts
│   │   ├── build99Temples.js       # Script to populate full 99 temple dataset
│   │   └── updateTempleImages.js   # Bulk update script for temple image links
│   ├── services/                   # Service Layer Abstractions
│   │   ├── bookingLockService.js   # Redis atomic locking to prevent double bookings
│   │   ├── cacheService.js         # Redis Cache-Aside helper for temples and slots
│   │   └── otpService.js           # Cryptographic OTP generation & salted HMAC verification
│   ├── socket/                     # Socket.io Service
│   │   └── socketService.js        # Real-time WebSocket broadcasting (Redis adapter)
│   ├── utils/                      # Core Utility Functions
│   │   ├── emailHelper.js          # Nodemailer SMTP transporter & HTML email templates
│   │   ├── redisKeys.js            # Standardized Redis key naming pattern generator
│   │   └── tokenGenerator.js       # JWT creation and expiration helper
│   ├── workers/                    # RabbitMQ Consumers
│   │   ├── index.js                # Background worker launcher script
│   │   ├── emailWorker.js          # Consumes email queue & sends Nodemailer messages
│   │   ├── bookingWorker.js        # Consumes booking queue & broadcasts socket alerts
│   │   ├── paymentWorker.js        # Consumes payment queue & processes refunds
│   │   ├── notificationWorker.js   # Consumes notifications & sends push messages
│   │   └── analyticsWorker.js      # Consumes analytics events & updates DB metrics
│   ├── seed.js                     # Primary database initialization script
│   ├── server.js                   # API HTTP Server Entrypoint
│   └── package.json
│
├── frontend/                       # Vite + React Client Application
│   ├── public/                     # Static Assets & Images
│   │   └── images/temples/         # Local temple asset images
│   ├── src/
│   │   ├── assets/                 # SVGs and branding graphics
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── Navbar.jsx          # Top navigation bar with responsive drawer
│   │   │   ├── Footer.jsx          # Site footer with platform links
│   │   │   ├── MonthlyCalendar.jsx # Custom calendar for selecting darshan dates
│   │   │   ├── QRScannerModal.jsx  # Live web-cam scanner for gate staff verification
│   │   │   ├── AnalyticsCharts.jsx # Recharts charts for executive dashboard
│   │   │   ├── LanguageSelector.jsx# Multi-language dropdown (English, Telugu, Hindi, etc.)
│   │   │   ├── OTPInput.jsx        # 6-digit OTP verification input component
│   │   │   └── ProtectedRoute.jsx  # Route permission guard based on JWT role
│   │   ├── context/                # Global State Contexts
│   │   │   └── AuthContext.jsx     # User auth state, login/logout, JWT token storage
│   │   ├── i18n/                   # Internationalization
│   │   │   └── index.js            # i18next configuration & multi-lingual dictionaries
│   │   ├── pages/                  # Route Page Components
│   │   │   ├── Home.jsx            # Landing page with hero banner & featured temples
│   │   │   ├── Temples.jsx         # Searchable & filterable temple directory page
│   │   │   ├── BookDarshan.jsx     # Slot reservation workflow & payment modal
│   │   │   ├── MyBookings.jsx      # Devotee ticket management & QR pass viewer
│   │   │   ├── Donate.jsx          # Online donation page with instant receipts
│   │   │   ├── AuthPage.jsx        # Devotee Login & Registration page
│   │   │   ├── AdminLogin.jsx      # Portal login for Admin, Organizers & Staff
│   │   │   ├── TempleStaffDashboard.jsx # Gate check-in & QR scanner dashboard
│   │   │   ├── OrganizerDashboard.jsx  # Slot management & capacity control dashboard
│   │   │   ├── AdminDashboard.jsx  # System-wide administrative control center
│   │   │   ├── AboutUs.jsx         # Platform overview & story page
│   │   │   └── ContactUs.jsx       # Contact form & feedback page
│   │   ├── services/               # API Service Clients
│   │   │   └── api.js              # Axios instance with auth headers & error handlers
│   │   ├── App.jsx                 # Application route tree & layout wrapper
│   │   ├── index.css               # Modern design tokens & global CSS styles
│   │   └── main.jsx                # React app DOM mounting entrypoint
│   ├── vite.config.js              # Vite build server configuration
│   └── package.json
│
├── render.yaml                     # Render Cloud deployment specification
├── package.json                    # Root monorepo workspace scripts
└── README.md                       # Project documentation
```

---

## 🔁 System Architecture & Data Flow

```text
                               DARSHANEASE PLATFORM ARCHITECTURE
                               

  Devotee Client (React)    Temple Staff (Mobile/Desktop)   Admin / Organizer Dashboard
           │                             │                             │
           └─────────────────────────────┼─────────────────────────────┘
                                         │  (HTTP REST / WebSockets)
                                         ▼
                                  ┌──────────────┐
                                  │ Express API  │
                                  │ (server.js)  │
                                  └──────┬───────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  ┌──────────────┐               ┌──────────────┐               ┌───────────────────┐
  │ MongoDB      │               │ Redis 7      │               │ RabbitMQ Broker   │
  │ Atlas        │               │ Cache & Lock │               │ (Async Tasks)     │
  └──────────────┘               └──────────────┘               └─────────┬─────────┘
  • Permanent Data               • Distributed Locks                      │
  • Users & Roles                • Cache-Aside (Slots)                    ▼
  • Temples & Slots              • Rate Limiting                 ┌──────────────────┐
  • Ticket Bookings              • Idempotency Keys              │ Worker Cluster   │
  • Donations                    • Socket Adapter                │ (workers/*.js)   │
                                                                 └────────┬─────────┘
                                                                          │
                                                                          ▼
                                                                 ┌──────────────────┐
                                                                 │ Resend / SMTP    │
                                                                 │ Email Delivery   │
                                                                 └──────────────────┘
```

### 1. Booking Workflow
1. Devotee chooses a temple on `Temples.jsx` and clicks **Book Darshan**.
2. `BookDarshan.jsx` queries available slots from `GET /api/slots`. The server checks the **Redis Cache**; if missed, it queries MongoDB and caches the response for 60 seconds.
3. Upon selecting a slot and submitting devotee details, `POST /api/bookings` acquires a 30-second **Redis Distributed Lock** (`darshanease:lock:booking:{slotId}`) to eliminate race conditions.
4. Once capacity is validated and payment succeeds, a **Booking** record with a unique QR code string is written to MongoDB.
5. An async event is pushed to **RabbitMQ** (`bookingQueue`), triggering `emailWorker.js` to dispatch an HTML ticket itinerary to the devotee's email.

### 2. Gate Check-in Workflow
1. Ground staff at temple gates open `TempleStaffDashboard.jsx`.
2. Staff scans the devotee's mobile QR code using `QRScannerModal.jsx` (HTML5 camera integration).
3. `POST /api/staff/verify-qr` verifies the token in MongoDB, ensures it hasn't been used yet, marks `isVerified = true`, and emits a real-time WebSocket update via `socketService.js`.

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Redis** (Local instance or Redis Cloud / Upstash)

### 1. Clone Repository
```bash
git clone https://github.com/ashokreddy92/DARSHAN.git
cd DARSHAN
```

### 2. Install Dependencies
Run the workspace installer script from the root folder:
```bash
npm run install-all
```

### 3. Seed Initial Database Records
Populate sample temples, organizers, admin accounts, and darshan slots:
```bash
npm run seed
```

### 4. Run Application Locally
Start both backend API and frontend Vite dev servers concurrently:
```bash
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend REST API:** `http://localhost:5000`

---

## ⚙️ Environment Variables

### Backend Environment (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/darshanease
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
REDIS_ENABLED=true

# RabbitMQ AMQP Broker
RABBITMQ_URL=amqps://user:pass@broker.cloudamqp.com/vhost

# Email Delivery — Option A: Resend REST API (Recommended for Render Free Tier over HTTPS Port 443)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=DarshanEase <onboarding@resend.dev>

# Email Delivery — Option B: SMTP (Gmail / Custom SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM=your_email@gmail.com
# (Or backward-compatible: EMAIL_USER / EMAIL_PASS)

# Payment Gateways (Optional)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend Environment (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## ⚡ Redis Caching, Concurrency & Rate Limiting

DarshanEase employs **Redis 7+** as a high-throughput concurrency and performance layer:

### Key Namespaces (`utils/redisKeys.js`)
| Purpose | Namespace Pattern | Default TTL |
| :--- | :--- | :--- |
| **Email OTP** | `darshanease:otp:{email}` | 5 Minutes |
| **Distributed Lock** | `darshanease:lock:booking:{slotId}` | 30 Seconds |
| **Slot Availability Cache** | `darshanease:slots:{templeId}:{date}` | 60 Seconds |
| **Temple Details Cache** | `darshanease:temple:{templeId}` | 15 Minutes |
| **Rate Limiters** | `darshanease:rate:{endpoint}:{ip}` | 60s - 15m |
| **Idempotency Keys** | `darshanease:idempotency:{key}` | 24 Hours |

### Features
* **Distributed Booking Locks (`services/bookingLockService.js`):** Prevents overbooking during high-demand festival rushes using atomic `SET key token NX EX 30` and safe Lua script release.
* **Cache-Aside Pattern (`services/cacheService.js`):** Accelerates high-frequency read requests for temple lists and slot availability, automatically invalidating stale caches on updates.
* **Multi-Tier Sliding Window Rate Limiting (`middleware/rateLimiter.js`):** Protects sensitive endpoints (`/api/auth/send-otp`, `/api/bookings`, `/api/donations`) against spam and brute-force attacks.

---

## 🐇 RabbitMQ Asynchronous Task Queues

To guarantee low API latency, background jobs are offloaded to **RabbitMQ AMQP message queues**:

* **Email Queue (`queues/emailQueue.js` & `workers/emailWorker.js`):** Processes booking confirmations, OTP codes, and donation receipts in the background without blocking HTTP responses.
* **Booking Queue (`queues/bookingQueue.js` & `workers/bookingWorker.js`):** Handles ticket post-processing and triggers real-time capacity broadcasts.
* **Payment Queue (`queues/paymentQueue.js` & `workers/paymentWorker.js`):** Manages webhook verification and payment status updates asynchronously.

Start background workers independently:
```bash
cd backend
npm run workers
```

---

## 📱 Real-Time Gate Verification & QR Scanner

1. Every booking generates a unique cryptographic QR string stored in the `Booking` document.
2. Devotees display their ticket on `MyBookings.jsx`.
3. Gate staff log into `TempleStaffDashboard.jsx` and launch the embedded scanner (`QRScannerModal.jsx`), which uses the device camera to read the pass.
4. The system validates the pass instantly against `POST /api/staff/verify-qr`, preventing duplicate scans and displaying entry approval status.

---

## 🌐 Multi-Language Internationalization (i18n)

DarshanEase supports multiple regional languages to cater to devotees across India:
- 🇬🇧 **English**
- 🇮🇳 **Telugu (తెలుగు)**
- 🇮🇳 **Hindi (हिंदी)**
- 🇮🇳 **Tamil (தமிழ்)**
- 🇮🇳 **Kannada (కన్నడ)**

Language toggling is handled seamlessly on the frontend via **i18next** (`frontend/src/i18n/index.js`) and the [`LanguageSelector.jsx`](frontend/src/components/LanguageSelector.jsx) component.

---

## 🚀 Cloud Deployment (Render)

DarshanEase includes a production-ready [`render.yaml`](./render.yaml) blueprint for automated deployment:

### 1. Automated Blueprint Deployment
1. Connect your GitHub repository to [Render](https://render.com/).
2. In Render, select **New** > **Blueprint**.
3. Render automatically provisions:
   - `darshanease-backend` (Node.js Web Service)
   - `darshanease-frontend` (Static Site with SPA rewrite rules)

### 2. Configure Environment Variables
In the Render Dashboard under **darshanease-backend** > **Environment**, configure:
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: Secret key for JWT signing.
- `REDIS_URL`: Managed Redis instance (e.g., Redis Cloud or Upstash).
- `RABBITMQ_URL`: Managed CloudAMQP instance.

### 3. Email Delivery on Render
* **Render Free Tier (Recommended)**: Render's free tier firewall blocks outbound traffic on standard SMTP ports (`25`, `465`, `587`). To send real transactional emails on the Free Tier, configure `RESEND_API_KEY=re_...` in your Render Environment. [Resend](https://resend.com) operates over standard HTTPS (Port 443), which is 100% open and never blocked (free tier includes 3,000 emails/month).
* **Render Paid Tier / Local**: Direct SMTP via Gmail (`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASSWORD`) works without port restrictions.
* **Built-in Dev/Demo Fallback**: If outbound SMTP is blocked by the cloud provider, the server automatically prints the verification OTP to Render server logs (`🔑 [DEV/FALLBACK OTP LOG]`) and displays the code on screen so devotees can test and log in without disruption.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
