# CampusLibra - Library Management System
## Project Report

**Student Name:** [Your Name Here]  
**Student ID:** [Your Student ID]  
**Course:** Web Development II  
**Date:** January 11, 2026  
**Institution:** University of The Gambia

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technologies Used](#2-technologies-used)
3. [System Architecture](#3-system-architecture)
4. [Features Implemented](#4-features-implemented)
5. [API Endpoints](#5-api-endpoints)
6. [Database Design](#6-database-design)
7. [Screenshots](#7-screenshots)
8. [Deployment Links](#8-deployment-links)
9. [Testing Credentials](#9-testing-credentials)
10. [Challenges & Solutions](#10-challenges--solutions)
11. [Future Improvements](#11-future-improvements)
12. [Conclusion](#12-conclusion)

---

## 1. Project Overview

**CampusLibra** is a comprehensive library management system designed to streamline library operations for educational institutions. Built with modern web technologies, it provides a complete solution for managing books, tracking borrowing activities, handling reservations, and calculating fines.

### Key Features

- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Book Catalog Management**: Complete CRUD operations for managing library inventory
- **Borrowing System**: Track book checkouts, returns, and due dates
- **Reservation Queue**: Allow users to reserve books and manage waiting lists
- **Fine Management**: Automatic calculation and tracking of overdue penalties
- **Real-time Notifications**: Socket.IO integration for instant updates
- **Audit Trail**: Comprehensive logging of all system operations
- **Multi-Role Support**: Separate interfaces for Admins, Librarians, and Members

### System Capabilities

The system supports three distinct user roles, each with specific permissions:

- **Admin**: Full system access, user management, role assignment, system configuration
- **Librarian**: Book management, process borrowing and returns, manage reservations, handle fines
- **Member**: Browse books, borrow and return books, make reservations, view personal history

### Project Objectives

1. Automate library operations and reduce manual workload
2. Provide real-time tracking of book availability and borrowing status
3. Improve user experience with intuitive interfaces and instant notifications
4. Maintain comprehensive audit trails for accountability
5. Enable data-driven decision making through analytics dashboards

---

## 2. Technologies Used

### Frontend Technologies

#### Core Framework
- **Angular 16+**: Modern TypeScript-based framework for building dynamic web applications
- **TypeScript**: Type-safe JavaScript for better code quality and maintainability
- **RxJS**: Reactive programming library for handling asynchronous operations

#### UI/UX Libraries
- **Angular Material 16**: Material Design component library for consistent UI
  - Form controls (mat-form-field, mat-input)
  - Navigation (mat-toolbar, mat-sidenav)
  - Data display (mat-table, mat-card, mat-chip)
  - Dialogs and notifications (mat-dialog, mat-snackbar)
- **Responsive Design**: Mobile-first approach with flexible layouts

#### State Management & Routing
- **Angular Router**: Client-side routing with lazy loading
- **Route Guards**: AuthGuard and RoleGuard for access control
- **Reactive Forms**: FormBuilder with built-in validation

### Backend Technologies

#### Server Framework
- **Node.js**: JavaScript runtime for server-side applications
- **Express.js**: Fast, minimalist web framework
- **RESTful API Design**: Standard HTTP methods and resource-based URLs

#### Database
- **MongoDB Atlas**: Cloud-hosted NoSQL database
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB
- **Schema Design**: Proper relationships and validation rules

#### Security & Authentication
- **JWT (jsonwebtoken)**: Stateless authentication tokens
- **bcryptjs**: Password hashing algorithm (12 salt rounds)
- **Helmet**: Security headers middleware
- **express-rate-limit**: Rate limiting for API protection
- **CORS**: Cross-Origin Resource Sharing configuration

#### Real-time Communication
- **Socket.IO 4.8+**: WebSocket library for real-time notifications
- **Event-driven Architecture**: Pub/sub pattern for notifications

#### Validation & Error Handling
- **express-validator**: Request validation middleware
- **Custom Error Handler**: Centralized error handling middleware
- **express-mongo-sanitize**: Protection against NoSQL injection

#### Task Scheduling
- **node-cron**: Scheduled tasks for expired holds cleanup
- **Winston**: Logging library for application logs

### Development Tools

- **nodemon**: Auto-restart development server
- **dotenv**: Environment variable management
- **Git**: Version control
- **GitHub**: Repository hosting

### Deployment Infrastructure

#### Frontend Hosting
- **Netlify**: 
  - Continuous deployment from GitHub
  - Environment configuration
  - SPA routing support
  - SSL/HTTPS enabled

#### Backend Hosting
- **Render**:
  - Node.js environment
  - Auto-deploy from GitHub
  - Environment variables management
  - Health check monitoring

#### Database Hosting
- **MongoDB Atlas**:
  - Cloud-hosted MongoDB cluster
  - Automatic backups
  - Performance monitoring
  - Security features (IP whitelist, authentication)

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Angular)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Public    │  │   Member    │  │  Librarian  │        │
│  │    Pages    │  │  Dashboard  │  │  Dashboard  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Angular Services & HTTP Interceptors         │   │
│  │    (AuthService, BookService, Socket.IO Client)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                        │   │
│  │  • CORS  • Helmet  • Rate Limiter  • Auth  • Role   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Routes & Controllers                    │   │
│  │  /api/auth  /api/books  /api/borrows  /api/users   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Services (Business Logic)                  │   │
│  │  BookService  BorrowService  NotificationService    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Socket.IO Server                          │   │
│  │     (Real-time Notifications & Updates)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Protocol
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Books   │  │ Borrows  │  │  Roles   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │BookCopies│  │  Fines   │  │Reserv's  │  │  Audit   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User Login Request
   └─> Frontend: Login Form Submission
       └─> Backend: POST /api/auth/login
           └─> Validate credentials (bcrypt)
           └─> Generate JWT Token
           └─> Return token + user data
               └─> Frontend: Store token in localStorage
                   └─> Attach token to all API requests (HTTP Interceptor)
                       └─> Backend: Verify token (auth middleware)
                           └─> Check user role (role middleware)
                               └─> Allow/Deny access to resource
```

### Data Flow Example (Borrow a Book)

```
1. Member clicks "Borrow" button
   └─> Frontend: Angular Component
       └─> BookService.borrowBook(bookId)
           └─> HTTP POST /api/borrows
               └─> Backend: Auth Middleware (verify JWT)
                   └─> Role Middleware (check permissions)
                       └─> Controller: createBorrow()
                           └─> Service: BorrowService.createBorrow()
                               ├─> Check book availability
                               ├─> Create borrow record
                               ├─> Update book copy status
                               ├─> Create audit trail
                               └─> Emit notification (Socket.IO)
                                   └─> Frontend: Real-time notification
                                       └─> Update UI
```

### Role-Based Access Control (RBAC)

The system implements a comprehensive permission-based access control:

```
Roles:
├─ Admin
│  └─ Permissions: ALL (complete system access)
│
├─ Librarian
│  └─ Permissions:
│     ├─ book_* (create, read, update, delete)
│     ├─ borrow_* (view, create, return)
│     ├─ reservation_* (view, fulfill)
│     ├─ fine_* (view, manage)
│     └─ user_view, user_manage (block/unblock)
│
└─ Member
   └─ Permissions:
      ├─ book_view
      ├─ borrow_create, borrow_view
      ├─ reservation_create, reservation_view
      └─ fine_view
```

### Security Layers

1. **Transport Security**: HTTPS/WSS for all communications
2. **Authentication**: JWT tokens with expiration
3. **Authorization**: Role and permission-based middleware
4. **Input Validation**: express-validator for all requests
5. **Password Security**: bcrypt hashing with 12 salt rounds
6. **Rate Limiting**: 100-500 requests per 15 minutes
7. **CORS Policy**: Whitelist-based origin validation
8. **NoSQL Injection Protection**: Input sanitization
9. **Security Headers**: Helmet middleware

---

## 4. Features Implemented

### 4.1 Authentication & Authorization (15%)

#### User Registration
- **Validation**: Email format, password strength (minimum 6 characters)
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Auto-role Assignment**: Default member role for new registrations
- **Email Uniqueness**: Prevent duplicate accounts
- **Success Flow**: Redirect to login page for manual authentication

#### User Login
- **JWT Token Generation**: Stateless authentication
- **Token Storage**: localStorage for persistence
- **Role Detection**: Automatic role-based dashboard routing
- **Session Management**: Token expiration handling
- **Remember Me**: Persistent sessions

#### Role-Based Access Control
- **Three Roles Implemented**:
  - **Admin**: Full system access, user management, system configuration
  - **Librarian**: Book and borrow management, user blocking/unblocking
  - **Member**: Book browsing, borrowing, reservations

#### Protected Routes
- **Frontend Guards**:
  - `AuthGuard`: Checks if user is authenticated
  - `RoleGuard`: Verifies user has required role for route
  - Automatic redirection for unauthorized access
  
- **Backend Middleware**:
  - `authMiddleware`: JWT token verification
  - `authorizeRoles`: Role-based route protection
  - `authorizePermission`: Fine-grained permission checks

### 4.2 CRUD Operations (20%)

#### Books Management (Full CRUD)

**Create**:
- Add new books with title, author, ISBN, published date, category
- Automatic book copy generation
- Audit trail creation
- Form validation (required fields, format checks)

**Read**:
- List all books with pagination
- Search by title, author, or ISBN
- Filter by category
- View detailed book information
- Display available copies count

**Update**:
- Edit book details
- Update metadata
- Maintain audit history
- Validation of changes

**Delete**:
- Soft delete with confirmation
- Check for active borrows before deletion
- Cascade handling for related records
- Audit trail logging

#### Users Management (Full CRUD)

**Create**:
- User registration system
- Manual user creation by admins
- Default role assignment
- Email validation and uniqueness check

**Read**:
- View all users (admin/librarian only)
- User profile viewing
- Filter by role
- Search by name or email

**Update**:
- Profile updates (name, email)
- Password change functionality
- Role assignment (admin only)
- Block/unblock user accounts

**Delete**:
- User account deletion (admin only)
- Confirmation dialogs
- Cascade handling for user data

#### Borrows Management

**Create**:
- Book checkout process
- Due date calculation based on system settings
- Book copy allocation
- User borrowing limit checks
- Notification dispatch

**Read**:
- View active borrows
- Borrow history
- Overdue tracking
- Filter by user or book

**Update**:
- Process returns
- Extend due dates
- Mark as returned
- Calculate fines for overdue

**Delete**:
- Cancel borrow (before pickup)
- Admin override capabilities

#### Reservations Management

**Create**:
- Place book on hold
- Queue position assignment
- Hold expiration date calculation
- Notification on availability

**Read**:
- View user reservations
- Check queue status
- Active and expired holds

**Update**:
- Fulfill reservation (convert to borrow)
- Cancel reservation
- Update hold expiration

**Delete**:
- Remove expired reservations
- Admin cancellation

#### Additional CRUD Entities

- **Fines**: Track, calculate, pay overdue penalties
- **Roles**: Create, modify, delete user roles
- **Permissions**: Manage system permissions
- **Settings**: System configuration (borrow duration, fine rates)
- **Notifications**: Create, read, mark as read
- **Audit Logs**: View system activity history

### 4.3 RESTful API Development (20%)

#### Express.js Implementation
- Clean route structure
- RESTful conventions (nouns for resources)
- Proper HTTP verbs (GET, POST, PUT, PATCH, DELETE)
- Consistent URL patterns

#### Controller-Service Pattern

**Controllers** (11 controllers):
- Handle HTTP requests/responses
- Input validation
- Call service methods
- Return formatted responses
- Examples:
  - `auth.controller.js`: Login, register, profile
  - `book.controller.js`: Book CRUD operations
  - `borrow.controller.js`: Borrow management
  - `user.controller.js`: User management

**Services** (6 services):
- Business logic layer
- Database operations
- Complex calculations
- Third-party integrations
- Examples:
  - `auth.service.js`: Authentication logic
  - `book.service.js`: Book business rules
  - `borrow.service.js`: Borrow calculations, fine logic

#### Error Handling
- Centralized error middleware
- HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Descriptive error messages
- Stack traces in development mode
- Graceful error recovery

#### Validation
- Request validation using express-validator
- Schema validation for all inputs
- Custom validation rules
- Error aggregation and formatting

#### API Response Format
```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error description",
  "details": [ ... ]
}
```

### 4.4 Frontend Development & UI/UX (15%)

#### Angular Application Structure
- **Modular Architecture**: Feature modules (admin, librarian, member)
- **Lazy Loading**: Improved initial load time
- **Routing**: Multiple route configurations with guards
- **State Management**: Observable-based state with RxJS

#### Reactive Forms
- FormBuilder for dynamic form creation
- Built-in validators (required, email, minLength)
- Custom validators for business rules
- Real-time validation feedback
- Error message display

#### Meaningful Dashboards

**Admin Dashboard**:
- System statistics overview
- User management interface
- Book inventory summary
- Borrow and fine analytics
- Activity audit logs

**Librarian Dashboard**:
- Pending returns list
- Active borrows overview
- Reservation queue
- Quick book lookup
- Return processing interface

**Member Dashboard**:
- Active borrows with due dates
- Reservation status
- Outstanding fines
- Borrowing history
- Book recommendations

#### Loading Indicators
- Spinner during API calls
- Skeleton loaders for content
- Progress bars for long operations
- Loading states in buttons

#### Alert Messages
- Success notifications (green)
- Error alerts (red)
- Warning messages (yellow)
- Info messages (blue)
- Toast notifications with auto-dismiss

#### Search & Filter Features

**Search**:
- Book search by title, author, ISBN
- User search by name, email
- Real-time search results
- Debounced input for performance

**Filters**:
- Category filtering (multiple selection)
- Status filters (available, borrowed, reserved)
- Date range filters (borrows, fines)
- Role filters (user management)
- Active/inactive toggles

#### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interfaces
- Hamburger menu for mobile
- Flexible grid system
- Angular Material responsive utilities

#### UI Components Used
- mat-toolbar: Navigation bars
- mat-sidenav: Side navigation
- mat-card: Content containers
- mat-table: Data tables
- mat-form-field: Form inputs
- mat-button: Action buttons
- mat-icon: Material icons
- mat-dialog: Modal dialogs
- mat-chip: Category chips
- mat-badge: Notification badges
- mat-snackbar: Toast notifications

### 4.5 Advanced Features (Beyond Requirements)

#### Real-time Notifications (Socket.IO)
- Instant updates for book availability
- Return reminders
- Reservation notifications
- Fine alerts
- Admin announcements
- User blocking notifications

#### Audit Trail System
- Track all CRUD operations
- User activity logging
- Book creation tracking
- Borrow/return history
- Role changes
- System configuration changes

#### Fine Calculation System
- Automatic overdue detection
- Configurable fine rates
- Grace period support
- Fine accumulation
- Payment tracking
- Fine waivers (admin)

#### Reservation Queue Management
- FIFO queue system
- Position tracking
- Hold expiration (48 hours default)
- Automatic notifications
- Priority handling

#### Dashboard Analytics
- Borrows per month chart
- Overdue statistics
- Fine summary
- Active users count
- Book popularity ranking
- User engagement metrics

#### Permission-Based System
- Granular permissions (30+ permissions)
- Dynamic permission assignment
- Permission categories
- Role-permission mapping

---

## 5. API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/api/auth/register` | Register new user | No | - |
| POST | `/api/auth/login` | User login | No | - |
| PUT | `/api/auth/profile` | Update profile | Yes | All |
| POST | `/api/auth/change-password` | Change password | Yes | All |

### Books Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/books` | Get all books | No | - |
| GET | `/api/books/:id` | Get book by ID | No | - |
| POST | `/api/books` | Create new book | Yes | Admin, Librarian |
| PUT | `/api/books/:id` | Update book | Yes | Admin, Librarian |
| DELETE | `/api/books/:id` | Delete book | Yes | Admin, Librarian |
| GET | `/api/books/:id/copies` | Get book copies | No | - |

### Users Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/users` | Get all users | Yes | Admin, Librarian |
| GET | `/api/users/:id` | Get user by ID | Yes | Admin, Librarian |
| PUT | `/api/users/:id` | Update user | Yes | Admin |
| DELETE | `/api/users/:id` | Delete user | Yes | Admin |
| PATCH | `/api/users/:id/role` | Change user role | Yes | Admin |
| PATCH | `/api/users/:id/block` | Block user | Yes | Admin, Librarian |
| PATCH | `/api/users/:id/unblock` | Unblock user | Yes | Admin, Librarian |

### Borrows Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/api/borrows` | Create borrow | Yes | All |
| GET | `/api/borrows/my` | Get user's borrows | Yes | All |
| GET | `/api/borrows` | Get all borrows | Yes | Admin, Librarian |
| PATCH | `/api/borrows/:id/return` | Process return | Yes | Admin, Librarian |
| PATCH | `/api/borrows/:id/extend` | Extend due date | Yes | All |
| GET | `/api/borrows/overdue` | Get overdue borrows | Yes | Admin, Librarian |

### Reservations Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/reservations` | Get user's reservations | Yes | All |
| POST | `/api/reservations` | Create reservation | Yes | All |
| GET | `/api/reservations/pending` | Get pending reservations | Yes | Admin, Librarian |
| POST | `/api/reservations/:id/fulfill` | Fulfill reservation | Yes | Admin, Librarian |
| DELETE | `/api/reservations/:id` | Cancel reservation | Yes | All |

### Fines Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/fines` | Get user's fines | Yes | All |
| GET | `/api/fines/all` | Get all fines | Yes | Admin, Librarian |
| PATCH | `/api/fines/:id/pay` | Pay fine | Yes | All |
| DELETE | `/api/fines/:id` | Waive fine | Yes | Admin |

### Roles Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/roles` | Get all roles | Yes | Admin |
| GET | `/api/roles/:id` | Get role by ID | Yes | Admin |
| POST | `/api/roles` | Create role | Yes | Admin |
| PUT | `/api/roles/:id` | Update role | Yes | Admin |
| DELETE | `/api/roles/:id` | Delete role | Yes | Admin |

### Settings Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/settings` | Get all settings | Yes | Admin |
| PUT | `/api/settings/:key` | Update setting | Yes | Admin |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/dashboard/borrows-per-month` | Monthly borrow stats | Yes | Admin, Librarian |
| GET | `/api/dashboard/overdue-stats` | Overdue statistics | Yes | Admin, Librarian |
| GET | `/api/dashboard/fine-summary` | Fine summary | Yes | Admin, Librarian |
| GET | `/api/dashboard/active-users` | Active users count | Yes | Admin, Librarian |
| GET | `/api/dashboard/audit-trail` | System audit logs | Yes | Admin |
| GET | `/api/dashboard/book-popularity` | Popular books | Yes | Admin, Librarian |
| GET | `/api/dashboard/user-engagement` | User engagement metrics | Yes | Admin |

### Notifications Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/notifications` | Get user notifications | Yes | All |
| PATCH | `/api/notifications/:id/read` | Mark as read | Yes | All |
| DELETE | `/api/notifications/:id` | Delete notification | Yes | All |

### Audit Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/audit` | Get audit logs | Yes | Admin |
| GET | `/api/audit/:id` | Get audit by ID | Yes | Admin |

---

## 6. Database Design

### Entity Relationship Overview

```
Users ──< Borrows >── Books
  │         │
  │         └─> BookCopies
  │         └─> Fines
  │
  ├──< Reservations >── Books
  │
  ├─> Roles ──< Permissions
  │
  └──< Notifications
       │
       └──< BookAudits
```

### Database Models

#### User Model
```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase),
  password: String (hashed with bcrypt, 12 salt rounds),
  role: ObjectId (ref: 'Role'),
  isBlocked: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- email (unique)
- role
```

#### Book Model
```javascript
{
  _id: ObjectId,
  title: String (required, trimmed),
  author: String (required, trimmed),
  isbn: String (unique, sparse),
  publishedDate: Date,
  category: String (trimmed),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- isbn (unique, sparse)
- { title: 'text', author: 'text' } (text search)
- category

Virtuals:
- copies: references BookCopy collection
```

#### BookCopy Model
```javascript
{
  _id: ObjectId,
  book: ObjectId (ref: 'Book', required),
  Barcode: String (unique, sparse, trimmed),
  status: String (required, default: 'available'),
  // Status: 'available', 'borrowed', 'reserved', 'maintenance'
  location: String (trimmed),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- book
- Barcode (unique, sparse)
- status
```

#### Borrow Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  book: ObjectId (ref: 'Book', required),
  bookCopy: ObjectId (ref: 'BookCopy', required),
  borrowDate: Date (default: now),
  dueDate: Date (required),
  returnDate: Date,
  status: String (required, default: 'active'),
  // Status: 'active', 'returned', 'overdue'
  renewalCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- user
- book
- bookCopy
- status
- dueDate
```

#### Reservation Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  book: ObjectId (ref: 'Book', required),
  status: String (required, default: 'pending'),
  // Status: 'pending', 'ready', 'fulfilled', 'expired', 'cancelled'
  queuePosition: Number,
  reservedDate: Date (default: now),
  holdExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- user
- book
- status
- holdExpiresAt
```

#### Fine Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  borrow: ObjectId (ref: 'Borrow', required),
  amount: Number (required, min: 0),
  reason: String (e.g., 'Overdue', 'Damage', 'Lost'),
  isPaid: Boolean (default: false),
  paidDate: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- user
- borrow
- isPaid
```

#### Role Model
```javascript
{
  _id: ObjectId,
  name: String (required, unique, enum: ['admin', 'librarian', 'member']),
  description: String (required),
  permissions: [ObjectId] (ref: 'Permission'),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- name (unique)
```

#### Permission Model
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  // Examples: 'book_create', 'user_manage', 'fine_waive'
  description: String (required),
  category: String (enum: ['book', 'user', 'borrow', 'reservation', 'fine', 'role', 'system']),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- name (unique)
- category
```

#### Notification Model
```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: 'User', required),
  type: String (required),
  // Types: 'book_returned', 'reservation_available', 'fine_created',
  //        'user_blocked', 'borrow_due_soon'
  title: String (required),
  message: String (required),
  isRead: Boolean (default: false),
  metadata: Mixed (additional data),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- recipient
- isRead
- createdAt
```

#### BookAudit Model
```javascript
{
  _id: ObjectId,
  book: ObjectId (ref: 'Book', required),
  bookCopy: ObjectId (ref: 'BookCopy'),
  action: String (required),
  // Actions: 'created', 'updated', 'deleted', 'copy_added', 'copy_removed'
  performedBy: ObjectId (ref: 'User', required),
  details: Mixed (additional action details),
  timestamp: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- book
- performedBy
- timestamp
```

#### Setting Model
```javascript
{
  _id: ObjectId,
  key: String (required, unique, trimmed),
  // Keys: 'borrow_duration_days', 'fine_rate_per_day', 
  //       'max_borrows_per_user', 'hold_expiration_hours'
  value: Mixed (required),
  description: String (trimmed),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- key (unique)
```

### Database Relationships

1. **User → Borrow** (One-to-Many): A user can have multiple borrows
2. **Book → Borrow** (One-to-Many): A book can be borrowed multiple times
3. **BookCopy → Borrow** (One-to-Many): Each physical copy can be borrowed
4. **User → Reservation** (One-to-Many): A user can reserve multiple books
5. **Book → Reservation** (One-to-Many): A book can have multiple reservations
6. **Borrow → Fine** (One-to-One): A borrow can generate one fine
7. **User → Notification** (One-to-Many): A user receives multiple notifications
8. **Book → BookCopy** (One-to-Many): A book has multiple physical copies
9. **Role → Permission** (Many-to-Many): Roles have multiple permissions
10. **User → Role** (Many-to-One): Users belong to one role

### Database Validation Rules

- **Email**: Must match email regex pattern
- **Password**: Minimum 6 characters before hashing
- **ISBN**: Optional but unique if provided
- **Dates**: Proper date format and logical constraints (dueDate > borrowDate)
- **Status**: Enum validation for allowed values
- **References**: Valid ObjectId references to existing documents

---

## 7. Screenshots

### 7.1 Authentication Pages

#### Login Page
```
[SCREENSHOT PLACEHOLDER: Login Page]
- Email and password input fields
- Login button
- Link to registration page
- Responsive layout
- Material Design UI
```

#### Registration Page
```
[SCREENSHOT PLACEHOLDER: Registration Page]
- Name, email, and password fields
- Form validation indicators
- Register button
- Link to login page
- Success message redirect
```

### 7.2 Public Pages

#### Home/Landing Page
```
[SCREENSHOT PLACEHOLDER: Home Page]
- Welcome banner
- Featured books carousel
- Book search bar
- Category filter chips
- Book grid/list view
- Footer with information
```

#### Book Catalog
```
[SCREENSHOT PLACEHOLDER: Book Catalog]
- Search and filter bar
- Category chips (multiple selection)
- Book cards with cover images
- Available copies indicator
- Borrow/Reserve buttons
- Pagination controls
```

#### Book Details Page
```
[SCREENSHOT PLACEHOLDER: Book Details]
- Book cover image
- Title, author, ISBN
- Publication date
- Category
- Description
- Available copies list
- Borrow/Reserve button
- Similar books section
```

### 7.3 Member Dashboard

#### Member Dashboard Overview
```
[SCREENSHOT PLACEHOLDER: Member Dashboard]
- Active borrows widget (with due dates)
- Active reservations widget
- Outstanding fines widget
- Quick actions panel
- Borrowing history link
- Recent activity feed
```

#### My Borrows Page
```
[SCREENSHOT PLACEHOLDER: My Borrows]
- Tabs: Active | Returned | Overdue
- Borrow cards showing:
  - Book title and author
  - Borrow date and due date
  - Days remaining indicator
  - Extend button (if allowed)
- Overdue warnings in red
- Return confirmation dialog
```

#### My Reservations Page
```
[SCREENSHOT PLACEHOLDER: My Reservations]
- Queue position indicator
- Status badges (Pending, Ready, Expired)
- Estimated availability date
- Hold expiration countdown
- Cancel reservation button
- Notification preferences
```

#### My Fines Page
```
[SCREENSHOT PLACEHOLDER: My Fines]
- Outstanding fines list
- Fine amount and reason
- Related borrow information
- Payment button
- Payment history
- Total outstanding amount
```

### 7.4 Librarian Dashboard

#### Librarian Dashboard Overview
```
[SCREENSHOT PLACEHOLDER: Librarian Dashboard]
- Pending returns counter
- Active borrows overview
- Pending reservations
- Recent activity log
- Quick search bar
- Statistics cards
```

#### Process Returns Page
```
[SCREENSHOT PLACEHOLDER: Process Returns]
- Search by user or book
- Active borrows table
- Return button for each item
- Fine calculation display
- Barcode scanner input
- Confirmation dialogs
```

#### Pending Reservations
```
[SCREENSHOT PLACEHOLDER: Pending Reservations]
- Reservation queue list
- User information
- Book details
- Queue position
- Fulfill button
- Notification button
```

#### Books Management
```
[SCREENSHOT PLACEHOLDER: Books Management]
- Add new book button
- Books table with edit/delete
- Book copies management
- Bulk import option
- Filter and search
- Status indicators
```

### 7.5 Admin Dashboard

#### Admin Dashboard Overview
```
[SCREENSHOT PLACEHOLDER: Admin Dashboard]
- System statistics cards:
  - Total users
  - Total books
  - Active borrows
  - Total fines collected
- Charts:
  - Borrows per month
  - Most popular books
  - User activity
- Quick actions panel
```

#### User Management
```
[SCREENSHOT PLACEHOLDER: User Management]
- Users table with columns:
  - Name, Email, Role, Status
- Filter by role dropdown
- Search users
- Edit, Delete, Block/Unblock buttons
- Role assignment dialog
- Add new user button
```

#### System Settings
```
[SCREENSHOT PLACEHOLDER: System Settings]
- Settings form:
  - Borrow duration (days)
  - Fine rate per day
  - Max borrows per user
  - Hold expiration hours
  - Grace period days
- Save button
- Reset to defaults
- Confirmation dialogs
```

#### Audit Trail
```
[SCREENSHOT PLACEHOLDER: Audit Trail]
- Activity log table:
  - Timestamp
  - User
  - Action
  - Details
- Date range filter
- Action type filter
- Export to CSV button
- Detailed view modal
```

### 7.6 Dialogs and Notifications

#### Confirmation Dialog
```
[SCREENSHOT PLACEHOLDER: Confirmation Dialog]
- Material dialog component
- Title and message
- Confirm and Cancel buttons
- Used for: delete, block user, etc.
```

#### Toast Notifications
```
[SCREENSHOT PLACEHOLDER: Toast Notifications]
- Success notification (green)
- Error notification (red)
- Warning notification (yellow)
- Auto-dismiss after 3 seconds
- Close button
```

#### Real-time Notification Bell
```
[SCREENSHOT PLACEHOLDER: Notification Bell]
- Bell icon in toolbar
- Badge showing unread count
- Dropdown list of notifications
- Mark as read functionality
- Click to navigate to related page
```

### 7.7 Mobile Responsive Views

#### Mobile Navigation
```
[SCREENSHOT PLACEHOLDER: Mobile Menu]
- Hamburger menu icon
- Slide-out navigation drawer
- Collapsible menu items
- User profile section
- Logout button
```

#### Mobile Book Cards
```
[SCREENSHOT PLACEHOLDER: Mobile Book View]
- Stacked book cards
- Touch-friendly buttons
- Swipe gestures
- Responsive images
- Simplified layout
```

---

## 8. Deployment Links

### Live Application URLs

**Frontend (Netlify)**:
- Production URL: `https://campuslibra.netlify.app`
- Deployment Status: ✅ Live
- SSL/HTTPS: Enabled
- Auto-deploy: GitHub main branch

**Backend API (Render)**:
- API Base URL: `https://campuslibra.onrender.com/api`
- Health Check: `https://campuslibra.onrender.com/health`
- Deployment Status: ✅ Live
- Auto-deploy: GitHub main branch
- Instance Type: Free tier

**Database (MongoDB Atlas)**:
- Cluster: `cluster0.fzqtuwf.mongodb.net`
- Database Name: `campusLibra`
- Region: AWS / Closest to Render backend
- Tier: M0 (Free)

### GitHub Repository

**Repository URL**: `https://github.com/[your-username]/campusLibra`

**Repository Structure**:
```
campusLibra/
├── frontend/          # Angular application
│   ├── src/
│   ├── angular.json
│   └── package.json
├── backend/           # Express.js API
│   ├── src/
│   ├── scripts/
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

### Environment Variables

**Frontend (.env or environment.ts)**:
- `apiUrl`: `https://campuslibra.onrender.com/api`
- `socketUrl`: `https://campuslibra.onrender.com`

**Backend (.env on Render)**:
- `PORT`: `5000`
- `NODE_ENV`: `production`
- `MONGODB_ATLAS_URI`: `mongodb+srv://ngangebabu_db_user:***@cluster0.fzqtuwf.mongodb.net/campusLibra`
- `JWT_SECRET`: `[secure-random-string]`
- `FRONTEND_URL`: `https://campuslibra.netlify.app`

### Deployment Configuration Files

**Frontend (netlify.toml)**:
```toml
[build]
  command = "npm run build:prod"
  publish = "dist/frontend"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**Backend (render.yaml)**:
```yaml
services:
  - type: web
    name: campuslibra
    env: node
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
```

---

## 9. Testing Credentials

### Pre-seeded User Accounts

Use these credentials to test different user roles and functionalities:

#### Admin Accounts

**Admin 1** (Primary):
- Email: `admin1@campuslibra.test`
- Password: `Password123!`
- Role: Administrator
- Permissions: Full system access

**Admin 2**:
- Email: `admin2@campuslibra.test`
- Password: `Password123!`

**Admin 3**:
- Email: `admin3@campuslibra.test`
- Password: `Password123!`

#### Librarian Accounts

**Librarian 1**:
- Email: `librarian1@campuslibra.test`
- Password: `Password123!`
- Role: Librarian
- Permissions: Book and borrow management

**Librarian 2**:
- Email: `librarian2@campuslibra.test`
- Password: `Password123!`

**Librarians 3-7**:
- Emails: `librarian[3-7]@campuslibra.test`
- Password: `Password123!`

#### Member Accounts

**Member 1**:
- Email: `member1@campuslibra.test`
- Password: `Password123!`
- Role: Member
- Permissions: Borrow and reserve books

**Members 2-15**:
- Emails: `member[2-15]@campuslibra.test`
- Password: `Password123!`

### Test Data

The system includes seeded data from the seed script:

- **Books**: ~570 books imported from Google Books API
- **Book Copies**: 2-8 copies per book (randomly distributed)
- **Categories**: 20+ different categories
- **Audit Records**: Creation records for all seeded books

### Testing Scenarios

#### Scenario 1: Member Workflow
1. Login as `member1@campuslibra.test`
2. Browse books on home page
3. Search for a specific book
4. Borrow an available book
5. View "My Borrows"
6. Make a reservation for an unavailable book
7. Check notifications

#### Scenario 2: Librarian Workflow
1. Login as `librarian1@campuslibra.test`
2. View pending returns
3. Process a book return
4. Add a new book
5. Manage book copies
6. Fulfill a pending reservation
7. View borrow statistics

#### Scenario 3: Admin Workflow
1. Login as `admin1@campuslibra.test`
2. View dashboard analytics
3. Manage users (view, edit, block)
4. Assign roles to users
5. Update system settings
6. View audit trail
7. Manage roles and permissions

#### Scenario 4: Password and Profile
1. Login with any account
2. Navigate to profile settings
3. Update profile information
4. Change password
5. Logout and login with new password

### API Testing (Postman/Thunder Client)

**Base URL**: `https://campuslibra.onrender.com/api`

**Example Requests**:

1. **Login**:
   ```
   POST /auth/login
   Body: {
     "email": "member1@campuslibra.test",
     "password": "Password123!"
   }
   ```

2. **Get Books**:
   ```
   GET /books
   Query: ?title=javascript&category=technology
   ```

3. **Create Borrow** (requires auth token):
   ```
   POST /borrows
   Headers: { "Authorization": "Bearer <token>" }
   Body: {
     "bookId": "<book-id>",
     "bookCopyId": "<copy-id>"
   }
   ```

---

## 10. Challenges & Solutions

### Challenge 1: CORS Configuration for Production

**Problem**: After deploying frontend to Netlify and backend to Render, CORS errors blocked API requests from the production frontend.

**Root Cause**: 
- Backend CORS was initially configured only for `localhost:4200`
- Socket.IO had separate CORS configuration
- Render backend was sending only one allowed origin in the response

**Solution**:
1. Updated backend CORS to accept multiple origins dynamically
2. Created `allowedOrigins` array including localhost and `FRONTEND_URL` env variable
3. Used origin callback function to validate requests
4. Applied same pattern to Socket.IO CORS configuration
5. Updated Render environment variable with Netlify URL

**Code Implementation**:
```javascript
const allowedOrigins = [
  'http://localhost:4200',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### Challenge 2: OnPush Change Detection Issues

**Problem**: Several components (Books, My Borrows, My Reservations) were stuck on loading spinners even after data loaded successfully.

**Root Cause**: 
- Components used `ChangeDetectionStrategy.OnPush` for performance
- Async data updates didn't trigger change detection
- Loading flags weren't updated properly

**Solution**:
1. Injected `ChangeDetectorRef` into affected components
2. Called `markForCheck()` after data updates in subscribe handlers
3. Ensured loading flags were set correctly in both success and error paths

**Code Example**:
```typescript
this.borrowService.getMyBorrows().subscribe({
  next: (borrows) => {
    this.borrows = borrows;
    this.loading = false;
    this.cdr.markForCheck(); // Trigger change detection
  },
  error: (err) => {
    this.error = err.message;
    this.loading = false;
    this.cdr.markForCheck();
  }
});
```

### Challenge 3: Home Page Infinite Loop on Filter Clear

**Problem**: Clearing category filters caused the application to crash with an infinite loop.

**Root Cause**: 
- `mat-chip-option` component fired `selectionChange` event during deselection
- This triggered API calls recursively
- Rate limiter was being hit repeatedly

**Solution**:
1. Added conditional check in `onCategorySelect()` method
2. Only process selection changes when chip is being selected (not deselected)
3. Increased rate limiter from 100 to 500 requests per 15 minutes for development

**Code Fix**:
```typescript
onCategorySelect(event: any, category: string): void {
  if (!event.selected) return; // Skip deselection events
  
  const index = this.selectedCategories.indexOf(category);
  if (event.selected && index === -1) {
    this.selectedCategories.push(category);
  }
  this.loadBooks();
}
```

### Challenge 4: MongoDB Atlas Connection Issues

**Problem**: Initial deployment failed with "bad auth - authentication failed" when connecting to MongoDB Atlas.

**Root Cause**: 
- Incorrect password in connection string
- Environment validation required both `MONGODB_URI` AND `MONGODB_ATLAS_URI`

**Solution**:
1. Corrected password in `.env` file
2. Updated `env.validator.js` to accept either URI (not both required)
3. Modified connection logic to prioritize Atlas URI
4. Added connection type logging for debugging

**Environment Validation**:
```javascript
if (!process.env.MONGODB_ATLAS_URI && !process.env.MONGODB_URI) {
  missing.push('MONGODB_URI or MONGODB_ATLAS_URI');
}
```

### Challenge 5: Netlify Bundle Size Exceeded

**Problem**: First Netlify deployment failed because the Angular bundle size exceeded the 1MB budget.

**Error Messages**:
- Initial bundle: 1.04 MB (exceeded 1 MB limit by 45.29 kB)
- Multiple component styles exceeded 2 KB limits

**Solution**:
1. Updated `angular.json` budget thresholds:
   - Initial bundle: 500kb → 800kb (warning), 1mb → 1.5mb (error)
   - Component styles: 2kb → 4kb (warning), 4kb → 8kb (error)
2. Pushed changes to trigger rebuild
3. Build succeeded with adjusted budgets

### Challenge 6: Socket.IO Origin Mismatch

**Problem**: Socket.IO connections failed because the backend returned only the Netlify origin, blocking localhost development.

**Root Cause**: 
- Socket.IO CORS configuration used array of origins
- Socket.IO doesn't echo the requesting origin by default when using an array

**Solution**:
1. Changed Socket.IO CORS to use origin callback function (matching Express CORS pattern)
2. Validated origin against whitelist
3. Returned `true` for allowed origins
4. Added credentials support

**Implementation**:
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (socketAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS (socket.io)'));
    },
    credentials: true,
  },
});
```

### Challenge 7: Auto-Login After Registration

**Problem**: Users were automatically logged in after registration, which wasn't the desired behavior.

**Solution**:
1. Removed session setup and notification connection from `register()` service method
2. Updated registration component to redirect to login page instead of home
3. Added query parameter `?registered=1` for success feedback
4. Users now manually login after registration

### Challenge 8: Member Management Block Button Not Working

**Problem**: Block/Unblock button in member management didn't respond to clicks.

**Root Cause**: Complex inline ternary expression in template broke click handler binding.

**Solution**:
1. Created dedicated `toggleBlockMember()` method in component
2. Simplified template click handler
3. Method handles both block and unblock operations
4. Added proper error handling and confirmation dialogs

### Challenge 9: Environment Configuration for Multiple Deployments

**Problem**: Managing different environment configurations for local development, Netlify production, and Render backend.

**Solution**:
1. Created separate environment files:
   - `environment.ts` for local development (now points to Render for testing)
   - `environment.prod.ts` for Netlify production
2. Added `build:prod` script using `--configuration production`
3. Updated both environments to point to Render backend
4. Documented environment variable setup in README

### Challenge 10: Notification System Integration

**Problem**: Implementing real-time notifications required coordination between backend events and frontend Socket.IO client.

**Solution**:
1. Created NotificationService on backend with Socket.IO integration
2. Implemented global `emitNotification()` function available across controllers
3. Built NotificationService on frontend with auto-reconnection
4. Connected user to Socket.IO on login
5. Disconnected and cleared notifications on logout
6. Added notification badge in toolbar
7. Implemented notification types for all major events

---

## 11. Future Improvements

### Feature Enhancements

1. **Email Notification System**
   - Send email reminders for due dates
   - Email alerts for reservation availability
   - Password reset via email
   - Welcome emails for new users

2. **QR Code Integration**
   - Generate QR codes for books and book copies
   - QR scanner for quick checkout/return
   - Digital library cards with QR codes
   - Mobile app barcode scanning

3. **Advanced Search**
   - Elasticsearch integration for full-text search
   - Search suggestions and autocomplete
   - Advanced filters (publication date range, language, format)
   - Saved search preferences

4. **Recommendation System**
   - Personalized book recommendations
   - "Users who borrowed this also borrowed..." feature
   - Category-based suggestions
   - Trending books section

5. **Mobile Application**
   - Native iOS and Android apps
   - Push notifications
   - Offline mode for viewing borrowed books
   - Camera-based barcode scanning

6. **Reading Lists & Reviews**
   - Personal reading lists
   - Book ratings and reviews
   - Reading goals and progress tracking
   - Social sharing features

7. **E-book Support**
   - Digital book lending
   - PDF/EPUB reader integration
   - Download limits and expiration
   - DRM protection

### Technical Improvements

1. **Performance Optimization**
   - Redis caching for frequently accessed data
   - Database query optimization
   - Lazy loading for images
   - Service worker for offline capabilities

2. **Testing Coverage**
   - Unit tests for all services
   - Integration tests for API endpoints
   - E2E tests with Cypress
   - Load testing with Artillery

3. **Security Enhancements**
   - Two-factor authentication (2FA)
   - OAuth integration (Google, Facebook login)
   - API rate limiting per user
   - Input sanitization improvements
   - Regular security audits

4. **Analytics Dashboard**
   - Advanced reporting features
   - Export reports to PDF/Excel
   - Custom date range analysis
   - Predictive analytics for book demand

5. **Internationalization (i18n)**
   - Multi-language support
   - Currency localization for fines
   - Date format localization
   - RTL language support

6. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader optimization
   - Keyboard navigation improvements
   - High contrast mode

### Administrative Features

1. **Bulk Operations**
   - Bulk book import from CSV/Excel
   - Bulk user creation
   - Batch email sending
   - Mass fine waivers

2. **Reporting System**
   - Scheduled reports
   - Custom report builder
   - Financial reports for fines
   - Inventory reports

3. **Integration APIs**
   - Library of Congress API integration
   - Google Books API enhancement
   - Payment gateway integration
   - Student information system integration

4. **Advanced Permissions**
   - Custom role creation
   - Granular permission management
   - Department-based access control
   - Temporary access grants

---

## 12. Conclusion

### Project Summary

CampusLibra successfully delivers a comprehensive library management solution that meets and exceeds all the minimum functional requirements for the Web Development II course project. The system demonstrates proficiency in modern web development technologies, including Angular for the frontend, Express.js for the backend, and MongoDB for data persistence.

### Key Achievements

1. **Robust Authentication System**: Implemented secure JWT-based authentication with bcrypt password hashing and multi-role support (Admin, Librarian, Member)

2. **Complete CRUD Operations**: Developed full CRUD functionality for multiple entities including Books, Users, Borrows, Reservations, Fines, and Roles

3. **RESTful API Architecture**: Built a well-structured API following REST principles with proper separation of concerns (controllers, services, routes)

4. **Modern Frontend**: Created an intuitive, responsive user interface using Angular Material components with reactive forms and validation

5. **Advanced Features**: Implemented real-time notifications, audit trails, fine calculation system, and reservation queue management beyond basic requirements

6. **Production Deployment**: Successfully deployed the application to cloud platforms (Netlify for frontend, Render for backend, MongoDB Atlas for database)

### Technical Skills Demonstrated

- **Frontend Development**: Angular, TypeScript, RxJS, Angular Material, Responsive Design
- **Backend Development**: Node.js, Express.js, RESTful API design, Middleware architecture
- **Database Management**: MongoDB, Mongoose ODM, Schema design, Indexing
- **Security**: JWT authentication, bcrypt hashing, CORS configuration, Input validation
- **Real-time Communication**: Socket.IO for live notifications
- **DevOps**: Git version control, CI/CD with Netlify and Render, Environment configuration
- **Testing**: Manual testing with multiple user roles, API testing

### Learning Outcomes

Throughout this project, valuable experience was gained in:

1. **Full-stack Development**: Building and connecting frontend and backend systems
2. **Security Best Practices**: Implementing authentication, authorization, and data protection
3. **Database Design**: Creating efficient schemas and relationships for complex data
4. **Deployment**: Managing production deployments and environment configurations
5. **Problem-solving**: Debugging CORS issues, change detection, and other technical challenges
6. **User Experience**: Designing intuitive interfaces for different user roles
7. **Code Organization**: Maintaining clean, modular, and maintainable code structure

### Project Impact

CampusLibra provides a practical solution for educational institutions to:
- Streamline library operations and reduce manual workload
- Track book inventory and borrowing activities efficiently
- Improve user experience with real-time updates and intuitive interfaces
- Generate insights through analytics and reporting
- Maintain accountability through comprehensive audit trails

### Acknowledgments

This project was developed as part of the Web Development II course at the University of The Gambia. Special thanks to the course instructor and peers for their guidance and support throughout the development process.

### Repository Information

**GitHub**: `https://github.com/[your-username]/campusLibra`

**Live Demo**: 
- Frontend: `https://campuslibra.netlify.app`
- API: `https://campuslibra.onrender.com/api`

**Documentation**: Comprehensive code documentation and README files are included in the repository for setup and deployment instructions.

---

**End of Report**

---

## Appendix A: Installation Instructions

### Local Development Setup

#### Prerequisites
- Node.js 18+ and npm
- MongoDB (local) or MongoDB Atlas account
- Git

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

#### Seed Database
```bash
cd backend
node scripts/seed.js
```

### Environment Variables

#### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campusLibra
MONGODB_ATLAS_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:4200
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000'
};
```

---

## Appendix B: API Response Examples

### Successful Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6789012345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "_id": "65a1b2c3d4e5f6789012346",
      "name": "member"
    }
  }
}
```

### Book List Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012347",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884",
      "category": "Technology",
      "availableCopies": 3,
      "totalCopies": 5
    }
  ],
  "pagination": {
    "total": 570,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid credentials",
  "statusCode": 401
}
```

---

**Document Version**: 1.0  
**Last Updated**: January 11, 2026  
**Total Pages**: 15
