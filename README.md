# 📚 CampusLibra - Library Management System

[![Angular](https://img.shields.io/badge/Angular-16+-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CampusLibra is a full-stack library management system designed for university libraries, built with Angular (frontend), Node.js/Express (backend), and MongoDB (database). It features role-based access control for three user types—Admins, Librarians, and Members—each with tailored dashboards and permissions. The system supports core library operations including book borrowing, reservations, automatic fine calculation for overdue items, and real-time notifications via Socket.IO. With a responsive Angular Material UI, comprehensive audit trails, and analytics dashboards, CampusLibra streamlines library workflows while ensuring security, scalability, and an intuitive user experience.

---

## 🌐 Live Demo

- **Frontend (Vercel):** [https://campus-libra.vercel.app](https://campus-libra.vercel.app)
- **Frontend (Netlify):** [https://campuslibra.netlify.app](https://campuslibra.netlify.app)
- **Backend API:** [https://campuslibra.onrender.com/api](https://campuslibra.onrender.com/api)

> **Note:** Backend may require 30-60 seconds to wake up on first request (Render free tier).

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure refresh token rotation
- Role-based access control (RBAC) with three user roles: Admin, Librarian, Member
- Fine-grained permission system for resource-level access control
- bcrypt password hashing with salt rounds for security
- HTTP-only cookies for refresh token storage

### 📖 Book Management
- Complete CRUD operations with audit trail logging
- Book copy tracking with real-time availability status
- Google Books API integration for automated metadata retrieval
- Dynamic category system with 13 normalized categories
- ISBN-based book identification
- Multi-copy inventory management per book title
- Advanced search by title, author, ISBN, and category

### 🔄 Borrowing & Returns
- Streamlined checkout process with automated due date calculation
- Configurable loan periods (minutes/hours/days for testing flexibility)
- Real-time book availability updates via Socket.IO
- Book renewal system with configurable limits
- Damage marking capability for returned book copies
- Overdue detection with automatic status updates
- Librarian-managed return processing

### 🎫 Reservation System
- Queue-based reservation management with position tracking
- Automated hold expiration using node-cron jobs
- Priority notifications when reserved books become available
- Configurable hold periods for pickup
- Automatic reservation cancellation for overdue pickups
- Member waitlist management

### 💰 Fine Management
- Automated overdue fine calculation based on configurable rates
- Real-time fine tracking and accumulation
- Payment processing with transaction history
- Fine waiver functionality for authorized staff
- Per-day fine rate configuration via system settings
- Unpaid fine enforcement (blocks new borrowing)

### 📊 Interactive Dashboards
- **Admin Dashboard:** System-wide analytics including total books, members, circulation statistics, and revenue metrics
- **Librarian Dashboard:** Operational metrics with pending returns, overdue items, and pickup queues
- **Member Dashboard:** Personalized view of active borrows, reservations, fines, and borrowing history
- Real-time updates via Socket.IO for all role-based dashboards
- SVG donut chart visualizations for book circulation popularity
- All-time circulation analytics with percentage breakdowns

### 🔔 Real-Time Notifications
- Socket.IO-powered instant notifications across all user sessions
- In-app notification center with badge counters
- Persistent read/unread state across page reloads
- Notification categories: due reminders, overdue alerts, reservation updates, fine notifications
- User-scoped notification filtering (users only see their own notifications)

### 🛡️ Security Features
- Helmet.js for secure HTTP headers (XSS, clickjacking protection)
- Express rate limiting (1000 req/15min general, 500 req/min API)
- NoSQL injection prevention with input sanitization
- CORS protection with origin whitelist
- MongoDB query sanitization
- Express-validator for input validation
- Winston logger for security audit trails

### ⚙️ System Administration
- **User Management:** Create, update, deactivate users; assign roles
- **Role Management:** Define custom roles with specific permission sets
- **Permission Management:** Granular access control at resource level
- **System Settings:** Configure loan periods, fine rates, hold durations
- **Audit Trail:** Complete activity logging with timestamps, users, and actions
- **Book Audit:** Track all book-related operations (additions, updates, deletions)
- Automated overdue fine calculation
- Multiple payment methods support
- Fine waiver functionality for staff
- Payment history tracking

### 📊 Admin Dashboard
- Real-time statistics with Socket.IO updates
- Role-specific dashboards (Admin, Librarian, Member)
- SVG donut chart visualizations
- Comprehensive audit trail
- System settings management

### 🔔 Real-Time Notifications
- Socket.IO-powered instant notifications
- In-app notification center with read/unread tracking
- Email notifications for critical events
- Persistent notification state across sessions

### 🎨 Responsive UI
- Modern Angular Material Design
- Mobile-first responsive design (480px/768px/1024px breakpoints)
- Intuitive navigation and user experience
- Progressive padding and font-size scaling

---

## 🏗️ System Architecture & Design

### Architecture Overview
CampusLibra follows a **client-server architecture** with a clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend (Angular)                           │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │ Components & Routing │ Services │ State Management (RxJS)   │     │
│  │ Auth Guards │ Interceptors │ Material UI │ Socket.IO Client │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                              ↕ REST API + WebSocket                  │
├──────────────────────────────────────────────────────────────────────┤
│                    Backend (Node.js/Express)                         │
│  ┌──────────────────────────────────────────────────────────┐        │
│  │ Controllers │ Routes │ Middlewares │ Error Handling      │        │
│  │ Auth Middleware │ Rate Limiter │ Validators │ Security   │        │
│  │              Services (Business Logic)                   │        │
│  │      Sockets (Real-time Broadcasting)                    │        │
│  │            Cron Jobs (Scheduled Tasks)                   │        │
│  └──────────────────────────────────────────────────────────┘        │
│                              ↕ Mongoose ODM                          │
├──────────────────────────────────────────────────────────────────────┤
│               Database (MongoDB Atlas Cloud)                         │
│  ┌──────────────────────────────────────────────────────────┐        │
│  │ 12 Collections │ Aggregation Pipelines │ Indexes         │        │
│  │ User │ Role │ Permission │ Book │ BookCopy │ Borrow      │        │
│  │ Reservation │ Fine │ Notification │ Setting │ Audit      │        │
│  └──────────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **Client Request** → Angular component sends HTTP/WebSocket request via service
2. **Authentication** → JWT token verified in auth middleware
3. **Authorization** → Role & permission checks via middleware
4. **Validation** → Input sanitization and express-validator rules
5. **Business Logic** → Service layer processes request
6. **Database Query** → Mongoose model executes MongoDB query
7. **Real-time Update** → Socket.IO broadcasts changes to connected clients
8. **Response** → Formatted JSON response sent back to client

### Key Design Patterns
- **MVC (Model-View-Controller)** - Clear separation in both frontend and backend
- **Service Layer** - Business logic isolated from routes/controllers
- **Dependency Injection** - Angular's built-in DI for services
- **Observer Pattern** - RxJS Observables for reactive data flow
- **Middleware Pipeline** - Express middleware chain for cross-cutting concerns
- **Repository Pattern** - Mongoose models as data access layer

---

## 🔌 API Endpoints Summary

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user account |
| POST | `/api/auth/login` | Login with email & password |
| POST | `/api/auth/refresh` | Refresh JWT access token |
| POST | `/api/auth/logout` | Logout and clear session |

### Book Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books with pagination |
| GET | `/api/books/:id` | Get book details |
| GET | `/api/books/categories` | Get distinct book categories |
| POST | `/api/books` | Create new book (Admin/Librarian) |
| PUT | `/api/books/:id` | Update book details |
| DELETE | `/api/books/:id` | Delete book (Admin only) |

### Borrowing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/borrows` | Get user's borrow history |
| POST | `/api/borrows` | Create new borrow (checkout) |
| PUT | `/api/borrows/:id/return` | Return borrowed book |
| PUT | `/api/borrows/:id/renew` | Renew book borrowing period |

### Reservation Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservations` | Get user's reservations |
| POST | `/api/reservations` | Create book reservation |
| DELETE | `/api/reservations/:id` | Cancel reservation |

### Fine Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fines` | Get user's fines |
| POST | `/api/fines/:id/pay` | Record fine payment |
| PUT | `/api/fines/:id/waive` | Waive fine (Librarian) |

### Notification Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| PUT | `/api/notifications/:id/unread` | Mark notification as unread |

### Dashboard Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/admin/stats` | Admin dashboard statistics |
| GET | `/api/dashboard/admin/circulation` | Book circulation analytics |
| GET | `/api/dashboard/librarian/stats` | Librarian operational stats |
| GET | `/api/dashboard/member/stats` | Member personal statistics |

### Admin Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| POST | `/api/users` | Create new user (Admin) |
| PUT | `/api/users/:id` | Update user details |
| DELETE | `/api/users/:id` | Deactivate user (Admin) |
| GET | `/api/roles` | Get all roles |
| GET | `/api/permissions` | Get all permissions |
| GET | `/api/audit` | Get audit trail logs |

### System Settings Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get system configuration |
| PUT | `/api/settings` | Update system settings (Admin) |

> **Note:** All endpoints except `/auth/register` and `/auth/login` require valid JWT token. Admin/Librarian endpoints include role authorization checks.

---

## 📸 Screenshots of Major Pages

### 1. Landing Page / Home
![Home Page](./screenshots/home.png)
*Public-facing home page with featured books, dynamic category filter, and search functionality. Members and guests can browse the library catalog.*

### 2. Login & Authentication
![Login](./screenshots/login.png)
*Secure login interface with email and password validation. Links to registration and password recovery.*

### 3. Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)
*System-wide analytics displaying total books, active members, issued books count, reserved books, overdue items, total fines collected, and real-time circulation percentage. SVG donut chart shows book popularity distribution.*

### 4. Book Management (Admin/Librarian)
![Book Management](./screenshots/books-manage.png)
*Complete book inventory management interface. Add new books from Google Books API, edit metadata, manage book copies, track copy status (available, loaned, damaged), and delete books. Real-time availability updates.*

### 5. Borrowing & Checkout
![Borrowing](./screenshots/borrowing.png)
*Seamless book checkout workflow showing available books, automatic due date calculation, configurable loan periods. Librarians process checkouts and manage active borrows.*

### 6. Book Returns & Damage Marking
![Returns](./screenshots/returns.png)
*Return processing interface for librarians. Mark books as returned with optional damage indication. Track condition and generate damage reports for returned copies.*

### 7. Reservation Queue
![Reservations](./screenshots/reservations.png)
*Members can reserve unavailable books. Shows reservation queue position, hold dates, and automatic notifications when books become available. Librarians manage pickup queues.*

### 8. Fine Management
![Fines](./screenshots/fines.png)
*Track overdue fines with automatic calculation based on configurable daily rates. Pay fines through the system, view payment history. Librarians can waive fines for members.*

### 9. Notification Center
![Notifications](./screenshots/notifications.png)
*Real-time notification center showing due reminders, overdue alerts, reservation ready notifications, and fine notifications. Mark as read/unread, persistent state across sessions.*

### 10. Member Profile
![Member Profile](./screenshots/profile.png)
*Member personal profile page showing active borrows, due dates, total fines, reservation count, borrowing history. Update account information and manage preferences.*

### 11. Librarian Dashboard
![Librarian Dashboard](./screenshots/librarian-dashboard.png)
*Operational dashboard for librarians. Displays pending returns, overdue items, upcoming reservation pickups, member check-in queue, and quick actions for common tasks.*

### 12. Audit Trail
![Audit Trail](./screenshots/audit-trail.png)
*Complete audit trail for admin. Filter by user, action type, date range, and resource. View who did what and when with detailed metadata.*

### 13. User Management (Admin)
![Users Manage](./screenshots/users-manage.png)
*Admin interface to manage users. Create new users, assign roles (Admin, Librarian, Member), update user information, deactivate accounts, and view user activity.*

### 14. Role & Permission Management (Admin)
![Role Management](./screenshots/role-management.png)
*Role and permission configuration for admins. Define custom roles with specific permissions like create:books, update:users, manage:fines, etc.*

### 15. System Settings (Admin)
![System Settings](./screenshots/system-settings.png)
*Configure system parameters including loan period duration, fine rate per day, reservation hold period, renewal limits, and notification preferences.*

---

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** Atlas account or local MongoDB instance
- **Git** for version control

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd campusLibra/backend

# Install dependencies
npm install

# Create .env file in the backend directory with these variables:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
JWT_REFRESH_SECRET=your_secure_refresh_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# Seed the database with sample data (creates 3 admins, 7 librarians, 15 members, and 200+ books)
node scripts/seed.js

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd campusLibra/frontend

# Install dependencies
npm install

# Update environment.ts file (src/environments/environment.ts)
# Set apiUrl to your backend URL:
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000'
};

# Start the development server
ng serve

# Or use npm
npm start
```

The application will open at `http://localhost:4200`

---

## 🔑 Test Credentials

After running the seed script, you can login with these test accounts:

### 👤 Librarian Accounts
- **Email:** `librarian1@campuslibra.test` to `librarian7@campuslibra.test`
- **Password:** `Password123!`
- **Access:** Book management, borrowing operations, returns, fine waivers, member management

### 👥 Member Accounts
- **Email:** `member1@campuslibra.test` to `member15@campuslibra.test`
- **Password:** `Password123!`
- **Access:** Browse books, borrow/reserve books, view personal history, pay fines

> **Note:** For security reasons, admin credentials are not published. Contact the system administrator for admin access.

---

## 📁 Project Structure

```
campusLibra/
│
├── backend/                         # Node.js/Express backend
│   ├── src/
│   │   ├── config/                 # Configuration files
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── logger.js          # Winston logger setup
│   │   │   └── env.validator.js   # Environment validation
│   │   │
│   │   ├── models/                 # Mongoose schemas (12 models)
│   │   │   ├── user.model.js
│   │   │   ├── role.model.js
│   │   │   ├── permission.model.js
│   │   │   ├── book.model.js
│   │   │   ├── bookCopy.model.js
│   │   │   ├── borrow.model.js
│   │   │   ├── reservation.model.js
│   │   │   ├── fine.model.js
│   │   │   ├── notification.model.js
│   │   │   ├── bookAudit.model.js
│   │   │   ├── setting.model.js
│   │   │   └── refreshToken.model.js
│   │   │
│   │   ├── controllers/            # Route handlers (12 controllers)
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── book.controller.js
│   │   │   ├── borrow.controller.js
│   │   │   ├── reservation.controller.js
│   │   │   ├── fine.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── role.controller.js
│   │   │   ├── permission.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── audit.controller.js
│   │   │   └── setting.controller.js
│   │   │
│   │   ├── routes/                 # Express routes
│   │   │   └── [12 route files]
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── book.service.js
│   │   │   ├── bookCopy.service.js
│   │   │   ├── borrow.service.js
│   │   │   ├── reservation.service.js
│   │   │   └── notification.service.js
│   │   │
│   │   ├── middlewares/            # Express middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── permission.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── error.middleware.js
│   │   │
│   │   ├── utils/                  # Helper utilities
│   │   │   ├── jwt.util.js
│   │   │   ├── date.util.js
│   │   │   ├── audit.util.js
│   │   │   ├── notification.util.js
│   │   │   ├── setting.util.js
│   │   │   ├── role.util.js
│   │   │   ├── permission.util.js
│   │   │   └── config.util.js
│   │   │
│   │   ├── sockets/                # Socket.IO handlers
│   │   │   └── notification.socket.js
│   │   │
│   │   └── jobs/                   # Scheduled jobs
│   │       └── expiredHolds.job.js
│   │
│   ├── scripts/
│   │   ├── seed.js                 # Database seeding
│   │   └── normalizeCategories.js # Category normalization
│   │
│   ├── logs/                       # Winston logs
│   ├── app.js                      # Express setup
│   ├── server.js                   # Entry point
│   └── package.json
│
└── frontend/                        # Angular frontend
    └── src/
        ├── app/
        │   ├── core/               # Core services & guards
        │   │   ├── guards/
        │   │   └── interceptors/
        │   │
        │   ├── models/             # TypeScript interfaces
        │   │
        │   ├── services/           # HTTP & Socket services
        │   │   ├── auth.service.ts
        │   │   ├── book.service.ts
        │   │   ├── borrow.service.ts
        │   │   ├── reservation.service.ts
        │   │   ├── fine.service.ts
        │   │   ├── notification.service.ts
        │   │   ├── dashboard.service.ts
        │   │   └── socket.service.ts
        │   │
        │   ├── shared/             # Shared components
        │   │
        │   ├── auth/               # Authentication
        │   │   ├── login/
        │   │   └── register/
        │   │
        │   ├── home/               # Public home
        │   │
        │   ├── books/              # Book browsing
        │   │   ├── book-list/
        │   │   └── book-detail/
        │   │
        │   ├── notifications/      # Notification center
        │   │
        │   ├── admin/              # Admin module
        │   │   ├── admin-dashboard/
        │   │   ├── users-manage/
        │   │   ├── books-manage/
        │   │   ├── role-management/
        │   │   ├── permission-management/
        │   │   ├── system-settings/
        │   │   └── audit-trail/
        │   │
        │   ├── librarian/          # Librarian module
        │   │   ├── librarian-dashboard/
        │   │   ├── member-management/
        │   │   ├── process-returns/
        │   │   └── pending-pickups/
        │   │
        │   └── member/             # Member module
        │       ├── member-dashboard/
        │       ├── my-borrows/
        │       ├── my-reservations/
        │       ├── my-fines/
        │       └── profile/
        │
        ├── assets/images/
        ├── environments/
        ├── styles.scss
        └── index.html
```

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Angular** | 16.2+ | SPA framework with TypeScript |
| **Angular Material** | 16.2+ | Material Design UI components |
| **RxJS** | 7.8+ | Reactive programming library |
| **Socket.IO Client** | 4.8+ | Real-time bidirectional events |
| **TypeScript** | 5.1+ | Static type checking |

### Backend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express.js** | 5.2+ | Web application framework |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 9.1+ | MongoDB object modeling |
| **Socket.IO** | 4.8+ | Real-time communication |
| **JWT** | 9.0+ | Token-based authentication |
| **bcryptjs** | 3.0+ | Password hashing |
| **Winston** | 3.19+ | Logging framework |
| **Helmet** | 8.1+ | Security headers |
| **express-rate-limit** | 8.2+ | Rate limiting middleware |
| **express-validator** | 7.3+ | Input validation |
| **node-cron** | 4.2+ | Task scheduling |

### Database Models (12 Total)
1. **User** - User accounts with role references
2. **Role** - Role definitions (Admin, Librarian, Member)
3. **Permission** - Granular permissions
4. **Book** - Book metadata
5. **BookCopy** - Physical book copies
6. **Borrow** - Borrowing transactions
7. **Reservation** - Book reservations
8. **Fine** - Overdue fines
9. **Notification** - User notifications
10. **BookAudit** - Book operation history
11. **Setting** - System configuration
12. **RefreshToken** - JWT refresh tokens

### Deployment Stack
- **Frontend:** Vercel & Netlify (CI/CD from Git)
- **Backend:** Render (Node.js service with auto-deploy)
- **Database:** MongoDB Atlas (Cloud cluster)

---

## 🔒 Security Implementation

### Authentication & Authorization
- ✅ **JWT Access Tokens** - 1 day expiration
- ✅ **Refresh Token Rotation** - 7 day expiration with HTTP-only cookies
- ✅ **bcrypt Password Hashing** - 10 salt rounds
- ✅ **Role-Based Access Control (RBAC)** - Admin, Librarian, Member roles
- ✅ **Permission-Based Protection** - Granular resource access control
- ✅ **Route Guards** - Frontend and backend endpoint protection

### Input Protection & Validation
- ✅ **Express-Validator** - Comprehensive input validation
- ✅ **NoSQL Injection Prevention** - $ and . character sanitization
- ✅ **MongoDB Query Parameterization** - Safe database queries
- ✅ **CORS with Whitelist** - Restricted cross-origin requests
- ✅ **XSS Prevention** - Input sanitization and Angular protections

### Security Middleware
- ✅ **Helmet.js** - Secure HTTP headers
- ✅ **Rate Limiting:**
  - General: 1000 requests per 15 minutes
  - API: 500 requests per minute (unauthenticated)
  - Authenticated requests bypass limits
- ✅ **Error Handling** - Sanitized error messages (no stack traces in production)

### Monitoring & Audit
- ✅ **Winston Logger** - File rotation with error/info levels
- ✅ **Audit Trail** - Complete operation logging
- ✅ **Request Logging** - Morgan HTTP request logger
- ✅ **BookAudit Model** - Track all book-related changes

---

## 👨‍💻 Developer

**Ngange Baboucarr Sallah**  

