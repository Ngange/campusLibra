#!/bin/bash

# CampusLibra Backend - Verification Script
# This script verifies that all critical components are in place

echo "CampusLibra Backend - Verification Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}OK${NC} $1 exists"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC} $1 missing"
        ((FAIL++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}OK${NC} $1 directory exists"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC} $1 directory missing"
        ((FAIL++))
    fi
}

# Function to check if pattern exists in file
check_pattern() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}OK${NC} $3"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC} $3 - NOT FOUND"
        ((FAIL++))
    fi
}

echo "Checking Required Files and Directories..."
echo ""

# Check main files
check_file "package.json"
check_file "server.js"
check_file "app.js"
check_file ".gitignore"

echo ""
echo "Checking Security Configuration..."
echo ""

# Check security packages
check_pattern "package.json" "helmet" "Helmet installed"
check_pattern "package.json" "express-rate-limit" "Rate limiting installed"
check_pattern "package.json" "express-mongo-sanitize" "Mongo sanitize installed"
check_pattern "package.json" "express-validator" "Validation installed"

echo ""
echo "Checking Middleware Files..."
echo ""

check_file "src/middlewares/auth.middleware.js"
check_file "src/middlewares/error.middleware.js"
check_file "src/middlewares/validation.middleware.js"
check_file "src/middlewares/role.middleware.js"
check_file "src/middlewares/permission.middleware.js"

echo ""
echo "Checking Security Configuration in app.js..."
echo ""

check_pattern "app.js" "helmet()" "Helmet middleware enabled"
check_pattern "app.js" "mongoSanitize()" "Mongo sanitize enabled"
check_pattern "app.js" "express-rate-limit" "Rate limiting configured"

echo ""
echo "Checking Validation Middleware..."
echo ""

check_pattern "src/middlewares/validation.middleware.js" "validateBorrow" "Borrow validation defined"
check_pattern "src/middlewares/validation.middleware.js" "validateUserRegistration" "User registration validation defined"
check_pattern "src/middlewares/validation.middleware.js" "handleValidationErrors" "Error handler defined"

echo ""
echo "Checking Routes with Validation..."
echo ""

check_pattern "src/routes/auth.routes.js" "validateUserRegistration" "Auth route has validation"
check_pattern "src/routes/borrow.routes.js" "validateBorrow" "Borrow route has validation"
check_pattern "src/routes/book.routes.js" "validateBookCreate" "Book route has validation"
check_pattern "src/routes/reservation.routes.js" "validateReservation" "Reservation route has validation"

echo ""
echo "Checking Database Indexes in Models..."
echo ""

check_pattern "src/models/book.model.js" "index({" "Book model has indexes"
check_pattern "src/models/borrow.model.js" "index({" "Borrow model has indexes"
check_pattern "src/models/user.model.js" "index({" "User model has indexes"
check_pattern "src/models/reservation.model.js" "index({" "Reservation model has indexes"
check_pattern "src/models/fine.model.js" "index({" "Fine model has indexes"

echo ""
echo "Checking Configuration Files..."
echo ""

check_file "src/config/env.validator.js"
check_file "src/config/logger.js"
check_file "src/config/db.js"

echo ""
echo "Checking Environment Validation..."
echo ""

check_pattern "server.js" "validateEnv()" "Environment validation called"
check_pattern "src/config/env.validator.js" "PORT.*MONGODB_URI.*JWT_SECRET.*NODE_ENV" "All required env vars specified"

echo ""
echo "Checking Logging Configuration..."
echo ""

check_pattern "app.js" "morgan" "Morgan HTTP logging configured"
check_pattern "src/middlewares/error.middleware.js" "logger.error" "Error logging configured"

echo ""
echo "Checking Error Handling..."
echo ""

check_pattern "src/middlewares/error.middleware.js" "validationErrors" "Validation error handling added"
check_pattern "src/middlewares/error.middleware.js" "statusCode" "Status code handling"
check_pattern "app.js" "errorHandler" "Error middleware mounted"

echo ""
echo "Checking Documentation Files..."
echo ""

check_file "IMPROVEMENTS_SUMMARY.md"
check_file "VALIDATION_TEST_GUIDE.md"
check_file "PRODUCTION_READINESS.md"
check_file "FRONTEND_INTEGRATION_GUIDE.md"

echo ""
echo "Checking Log Directory..."
echo ""

check_dir "logs"

echo ""
echo "Checking Graceful Shutdown..."
echo ""

check_pattern "server.js" "SIGTERM" "Graceful shutdown configured"
check_pattern "server.js" "gracefulShutdown" "Shutdown handler implemented"

echo ""
echo "Checking Health Check Endpoint..."
echo ""

check_pattern "app.js" "/health" "Health check endpoint added"

echo ""
echo "Checking Request ID Tracking..."
echo ""

check_pattern "app.js" "uuidv4" "UUID import present"
check_pattern "app.js" "req.id = uuidv4()" "Request ID middleware configured"

echo ""
echo "=============================================="
echo "Summary:"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All checks passed! Backend is ready.${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. Please review above.${NC}"
    exit 1
fi

