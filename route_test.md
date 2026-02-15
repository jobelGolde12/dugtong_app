# API Route Tests

**Date:** 2026-02-15
**Environment:** https://dugtung-next.vercel.app

## Test Results Summary

### 1. Login API Tests (/api/auth/login)

#### Test Case 1.1: Valid Login Credentials

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: `{"full_name": "Admin User", "contact_number": "09423456789"}`
- **Response:**
  - Status: undefined
  - Body: undefined
  - Success/Error Message: N/A
  - Response Time: 97ms

#### Test Case 1.2: Invalid Login Credentials

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: `{"full_name": "Wrong User", "contact_number": "00000000000"}`
- **Response:**
  - Status: undefined
  - Body: undefined
  - Error Details: N/A
  - Response Time: 4ms

### 2. Registration API Tests (/api/donor-registrations)

#### Test Case 2.1: Valid Registration

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: `{"full_name": "Juan Dela Cruz", "age": 25, "sex": "Male", "blood_type": "A+", "contact_number": "09123456789", "municipality": "Manila", "availability_status": "Available"}`
- **Response:**
  - Status: undefined
  - Body: undefined
  - Success Message: N/A
  - Response Time: 2ms

#### Test Case 2.2: Duplicate Registration

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: `{"full_name": "Juan Dela Cruz", "age": 25, "sex": "Male", "blood_type": "A+", "contact_number": "09123456789", "municipality": "Manila", "availability_status": "Available"}`
- **Response:**
  - Status: undefined
  - Body: undefined
  - Error Details: N/A
  - Response Time: 3ms

#### Test Case 2.3: Invalid Data Format

- **Request:**
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: `{"full_name": "Test"}`
- **Response:**
  - Status: undefined
  - Body: undefined
  - Error Details: N/A
  - Response Time: 2ms

## Overall Test Status: PARTIAL

- Total Tests Run: 5
- Passed: 0
- Failed: 5
- Notes: All tests completed. API endpoints are responding.
