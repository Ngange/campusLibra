# Role & Permission Management - Implementation Plan

## Current Status Analysis

### ✅ **Already Implemented**

#### Backend Models
- **Role Model** - With fields: name, description, permissions array, timestamps
- **Permission Model** - With fields: name, description, category, timestamps
- **User Model** - With role reference

#### Backend Controllers & Routes
- **Role Controller** - CRUD operations (GET all, GET by ID, POST, PUT, DELETE)
- **Role Routes** - Protected by admin role with validation
- **Permission Middleware** - `authorizePermission()` for granular access control
- **Seeding Utilities** - `permission.util.js` & `role.util.js` with default permissions & roles

#### Role-Based Access Control (RBAC)
- 3 predefined system roles: **admin**, **librarian**, **member**
- 17 predefined permissions across 7 categories (book, user, borrow, reservation, fine, role, system)

#### Permission Enforcement
- Role enum restriction in model (admin, librarian, member)
- Permission-based authorization middleware on key routes
- Role-based authorization middleware on protected routes

---

## Gap Analysis

### ⚠️ **Missing Components**

#### Backend Issues
1. **No Permission CRUD Endpoints** - Permission model exists but NO dedicated routes/controller
2. **Permission UI Missing** - No admin interface for managing permissions
3. **Role-Permission Management UI** - No way to edit which permissions a role has
4. **Limited Role Flexibility** - Only 3 hardcoded system roles allowed
5. **No Permission Seeding Route** - Permission creation only happens at startup
6. **No Audit Trail for Permission Changes** - No tracking when permissions are modified
7. **No Permission Documentation/Listing** - No endpoint to view available permissions

#### Frontend Issues
1. **No Permission Management Component** - No UI for managing permissions
2. **No Role Management Component** - No UI for managing roles
3. **No Permission Assignment UI** - Can't assign/remove permissions from roles
4. **No Service Layer** - No Angular service for role/permission API calls

---

## Implementation Plan

### **Phase 1: Complete Backend Functionality**

#### 1.1 Create Permission Controller
**File**: `backend/src/controllers/permission.controller.js`

**Functions to implement**:
```javascript
- getAllPermissions()     // GET all permissions with filtering
- getPermissionById()     // GET single permission
- getPermissionsByCategory() // GET permissions by category
- createPermission()      // POST new permission
- updatePermission()      // PUT update permission
- deletePermission()      // DELETE permission
```

#### 1.2 Create Permission Routes
**File**: `backend/src/routes/permission.routes.js`

**Routes**:
```
GET    /api/permissions              // List all permissions
GET    /api/permissions/:id          // Get by ID
GET    /api/permissions/category/:cat // Get by category
POST   /api/permissions              // Create (admin only)
PUT    /api/permissions/:id          // Update (admin only)
DELETE /api/permissions/:id          // Delete (admin only)
```

#### 1.3 Enhance Role Routes with Permission Management
**Add to**: `backend/src/routes/role.routes.js`

**New routes**:
```
GET    /api/roles/:id/permissions    // Get permissions for a role
POST   /api/roles/:id/permissions    // Assign permissions to role (admin)
PUT    /api/roles/:id/permissions/:permId // Update permission (admin)
DELETE /api/roles/:id/permissions/:permId // Remove permission (admin)
```

#### 1.4 Create Permission Service
**File**: `backend/src/services/permission.service.js`

**Functions**:
```javascript
- getAllPermissions(filters)
- getPermissionById(id)
- getPermissionsByCategory(category)
- createPermission(permData)
- updatePermission(id, permData)
- deletePermission(id)
- validatePermissionExists(permId)
```

#### 1.5 Create Role Service
**File**: `backend/src/services/role.service.js`

**Functions**:
```javascript
- getRoleWithPermissions(roleId)
- assignPermissionToRole(roleId, permissionId)
- removePermissionFromRole(roleId, permissionId)
- getPermissionsForRole(roleId)
- canDeleteRole(roleId)  // Prevent deletion of system roles
```

#### 1.6 Add Audit Logging
**Update**: `backend/src/controllers/permission.controller.js` & `role.controller.js`

**Log these operations**:
- Permission creation/update/deletion
- Role-permission assignments/removals
- Role creation/update/deletion

#### 1.7 Input Validation
**File**: `backend/src/middlewares/validation.middleware.js`

**Add validators**:
```javascript
- validatePermission()    // For POST/PUT permission
- validatePermissionUpdate()
- validateRolePermission()
```

**Validation rules**:
- Permission name: required, unique, alphanumeric with underscore
- Permission description: required, 10-500 chars
- Permission category: required, must match enum
- Role name: required, unique, alphanumeric with underscore
- Role description: required, 10-500 chars

---

### **Phase 2: Frontend Components**

#### 2.1 Create Permission Management Component
**File**: `frontend/src/app/admin/permission-manage/`

**Features**:
- List all permissions with category filtering
- Add new permission modal
- Edit permission modal
- Delete permission with confirmation
- Search/filter by name or category

#### 2.2 Create Role Management Component
**File**: `frontend/src/app/admin/role-manage/` (enhance existing)

**Features**:
- List all roles with description
- View role details with assigned permissions
- Add new role modal
- Edit role modal
- Assign/remove permissions from role
- Delete role (prevent system role deletion)
- Show which users have each role

#### 2.3 Create Permission Service
**File**: `frontend/src/app/services/permission.service.ts`

**Methods**:
```typescript
- getAllPermissions(filters?): Observable
- getPermissionById(id): Observable
- getPermissionsByCategory(cat): Observable
- createPermission(data): Observable
- updatePermission(id, data): Observable
- deletePermission(id): Observable
```

#### 2.4 Enhance Role Service
**File**: `frontend/src/app/services/role.service.ts`

**Additional methods**:
```typescript
- getRolePermissions(roleId): Observable
- assignPermission(roleId, permId): Observable
- removePermission(roleId, permId): Observable
```

#### 2.5 Update Admin Routing
**File**: `frontend/src/app/admin/admin-routing.module.ts`

**New route**:
```typescript
{ 
  path: 'permission-manage',
  component: PermissionManageComponent,
  canActivate: [RoleGuard],
  data: { roles: ['admin'] }
}
```

#### 2.6 Create Role-Permission Assignment Modal
**File**: `frontend/src/app/admin/role-permission-modal/`

**Features**:
- Multi-select permissions by category
- Current role permissions highlighted
- Search permissions
- Apply/cancel changes

---

### **Phase 3: UI/UX Enhancements**

#### 3.1 Admin Dashboard Updates
- Add navigation items for Role & Permission management
- Show summary cards (total roles, permissions, system health)

#### 3.2 Permission Matrix
- Create visual permission matrix showing:
  - Rows: All roles
  - Columns: All permissions
  - Checkmarks: Assigned permissions
  - Toggle to assign/remove

#### 3.3 Validation & Error Handling
- Prevent deletion of:
  - System roles (admin, librarian, member)
  - Permissions used by active roles
- Show validation errors clearly
- Prevent duplicate permission names

---

### **Phase 4: Security & Constraints**

#### 4.1 Permission Validation
- Prevent custom roles with reserved system names
- Validate permission category against enum
- Ensure at least one user exists with admin role
- Prevent removing all permissions from system roles

#### 4.2 Protected Operations
```javascript
// Only admin can:
- Create/update/delete permissions
- Create/update/delete custom roles
- Modify system role permissions (with restrictions)
- Assign/remove permissions

// Non-admins cannot:
- View permission management UI
- Modify any roles
- Delete system roles
```

---

## Database Changes Required

### Add indexes for performance:
```javascript
// Role indexes
roleSchema.index({ name: 1 });
roleSchema.index({ 'permissions': 1 });

// Permission indexes
permissionSchema.index({ name: 1 });
permissionSchema.index({ category: 1 });
```

---

## API Endpoint Summary

### **Permissions Endpoints**
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/permissions` | List all permissions | Admin |
| GET | `/api/permissions?category=book` | Filter by category | Admin |
| GET | `/api/permissions/:id` | Get by ID | Admin |
| POST | `/api/permissions` | Create permission | Admin |
| PUT | `/api/permissions/:id` | Update permission | Admin |
| DELETE | `/api/permissions/:id` | Delete permission | Admin |

### **Role Endpoints** (Enhanced)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/roles` | List all roles | Admin |
| GET | `/api/roles/:id` | Get by ID | Admin |
| GET | `/api/roles/:id/permissions` | Get role permissions | Admin |
| POST | `/api/roles` | Create role | Admin |
| PUT | `/api/roles/:id` | Update role | Admin |
| DELETE | `/api/roles/:id` | Delete role | Admin |
| POST | `/api/roles/:id/permissions/:permId` | Assign permission | Admin |
| DELETE | `/api/roles/:id/permissions/:permId` | Remove permission | Admin |

---

## Implementation Priority

### **High Priority** (Core CRUD)
1. Permission Controller & Routes
2. Permission Service
3. Role Service enhancements
4. Input validation

### **Medium Priority** (Frontend)
5. Permission Management Component
6. Role Management Component
7. Angular Services

### **Low Priority** (UX Enhancement)
8. Permission Matrix visualization
9. Admin dashboard updates
10. Advanced filtering/search

---

## Testing Strategy

### **Backend Testing**
```javascript
- Unit tests for permission service
- Integration tests for role-permission endpoints
- Permission authorization tests
- Duplicate prevention tests
- System role protection tests
```

### **Frontend Testing**
```typescript
- Component unit tests
- Service tests
- Modal interaction tests
- Form validation tests
- Error handling tests
```

---

## Migration Path

### **For Existing Data**
1. Seed default permissions if not exists
2. Update existing roles with new permissions
3. Validate all users have valid roles
4. Run permission sync utilities

---

## Timeline Estimate

- **Phase 1** (Backend): 2-3 days
- **Phase 2** (Frontend): 3-4 days  
- **Phase 3** (UI/UX): 1-2 days
- **Phase 4** (Security): 1 day
- **Testing**: 2-3 days

**Total**: ~9-13 days

---

## Success Criteria

✅ All CRUD operations working for permissions  
✅ All CRUD operations working for roles  
✅ Permission assignment/removal working  
✅ Audit trails recording changes  
✅ System roles protected from deletion  
✅ Frontend UI fully functional  
✅ Input validation comprehensive  
✅ All tests passing  
✅ No security vulnerabilities  
✅ Documentation complete  
