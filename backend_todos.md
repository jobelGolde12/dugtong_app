# Backend Todos Based on Registration 500 Error Tests

## Summary
The mobile app registration endpoint `POST /api/v1/donor-registrations` returns `500` with message:
`{"error": true, "message": "Internal database error", "type": "DatabaseError", "path": "/api/v1/donor-registrations"}`

This happens even when using the payload defined in `openapi.json`.

## Tests Performed

1. Baseline request (app payload shape)
   - Endpoint: `POST /api/v1/donor-registrations`
   - Body:
     - `full_name`: "Test User"
     - `age`: 30
     - `sex`: "Male"
     - `blood_type`: "O+"
     - `contact_number`: "09123456789"
     - `municipality`: "Sorsogon City"
     - `availability_status`: "Available"
   - Result: `500 Internal database error`

2. OpenAPI-aligned request (current backend schema)
   - Endpoint: `POST /api/v1/donor-registrations`
   - Body:
     - `full_name`: "Test User"
     - `contact_number`: "09123456789"
     - `age`: 30
     - `blood_type`: "O+"
     - `municipality`: "Sorsogon City"
     - `availability`: "available"
   - Result: `500 Internal database error`

3. Valid realistic data (confirmed still failing)
   - Endpoint: `POST /api/v1/donor-registrations`
   - Body:
     - `full_name`: "Maria Santos"
     - `contact_number`: "09175642831"
     - `age`: 29
     - `blood_type`: "O+"
     - `municipality`: "Sorsogon City"
     - `availability`: "available"
   - Result: `500 Internal database error`
   - Command:
     ```bash
     curl --max-time 20 -sS -X POST \
       "https://backend-blood-donor-api.onrender.com/api/v1/donor-registrations" \
       -H "Content-Type: application/json" \
       -d '{
         "full_name": "Maria Santos",
         "contact_number": "09175642831",
         "age": 29,
         "blood_type": "O+",
         "municipality": "Sorsogon City",
         "availability": "available"
       }' -w "\nSTATUS:%{http_code}\n"
     ```
   - Response:
     ```json
     {"error":true,"message":"Internal database error","type":"DatabaseError","path":"/api/v1/donor-registrations"}
     ```
   - Status: `500`

## Backend Investigation Checklist

1. Database connection and migrations
   - Verify DB URL and credentials for the deployed environment.
   - Check if migrations ran and created the `donor_registrations` table.
   - Confirm all required columns exist with correct types.

2. Schema mismatch or constraints
   - Inspect DB schema for NOT NULL constraints or missing defaults.
   - Check for unexpected unique constraints (e.g., `contact_number`).
   - Validate enum values for `availability` (e.g., `available`, `temporarily_unavailable`, `recently_donated`).

3. Model and validation alignment
   - Confirm Pydantic model matches database fields.
   - Ensure backend ignores unknown fields or rejects them gracefully.
   - Confirm `availability` default exists if omitted.

4. Logging and error visibility
   - Add server-side logs around create registration flow.
   - Log incoming payload and generated SQL.
   - Include database error details in logs (not in API response).

5. Seed data and dependencies
   - Confirm any dependent tables or foreign keys are present.
   - Check if registration creation requires related user records.

## Possible Solutions

1. Fix DB schema mismatches
   - Add missing columns (`availability`, `email`) or remove unused ones.
   - Add default values for nullable fields where appropriate.

2. Correct enum mapping
   - Ensure API accepts frontend values and maps to DB enums.
   - Normalize `availability` values before insert.

3. Relax or update constraints
   - If `contact_number` is unique, allow duplicates for pending registrations,
     or check for existing pending records and return 409 instead of 500.

4. Improve error handling
   - Catch DB exceptions and return 4xx with validation hints.
   - Provide a stable error response shape for the app to display.

5. Add integration tests
   - Add a backend test that posts the OpenAPI payload and asserts 201.
   - Add tests for missing optional fields and invalid enum values.

## Suggested Backend Test Payloads

1. Minimal valid
   - `full_name`: "Test User"
   - `contact_number`: "09123456789"
   - `age`: 30
   - `blood_type`: "O+"
   - `municipality`: "Sorsogon City"

2. With optional fields
   - Add `email`: "test@example.com"
   - Add `availability`: "available"

3. Invalid enum values
   - `availability`: "Available" (expect 422)
   - `availability`: "Temporarily Unavailable" (expect 422)

4. Duplicate contact number
   - Post twice with same `contact_number` to confirm behavior.

## New Tests After Backend Changes (Registration + Login)

### Registration Test (Valid)
Purpose: Confirm `POST /api/v1/donor-registrations` returns 201 and a proper response.

Command:
```bash
curl --max-time 20 -sS -X POST \
  "https://backend-blood-donor-api.onrender.com/api/v1/donor-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ana Reyes",
    "contact_number": "09171234567",
    "age": 28,
    "blood_type": "A+",
    "municipality": "Sorsogon City",
    "availability": "available"
  }' -w "\nSTATUS:%{http_code}\n"
```

Expected:
- HTTP 201
- Response includes `id`, `status`, `created_at`

Possible Errors:
- `500 Internal database error`
- `422 Validation Error`
- `409 Conflict` (if uniqueness rule exists)

How to Solve:
- If 500: check DB migrations, table exists, and columns match Pydantic model.
- If 422: verify required fields and allowed enums (`availability` should be `available`, `temporarily_unavailable`, or other allowed values).
- If 409: handle duplicate `contact_number` logic (return 409 with a clear message).

### Registration Test (Invalid Data -> 422)
Purpose: Ensure validation errors are returned as 422, not 500.

Command:
```bash
curl --max-time 20 -sS -X POST \
  "https://backend-blood-donor-api.onrender.com/api/v1/donor-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ana Reyes",
    "contact_number": "ABC123",
    "age": 28,
    "blood_type": "A+",
    "municipality": "Sorsogon City",
    "availability": "Available"
  }' -w "\nSTATUS:%{http_code}\n"
```

Expected:
- HTTP 422
- Error JSON should serialize `ctx` safely (no `ValueError` crash)

How to Solve If It Fails:
- If 500: confirm the validation exception handler is still converting non-serializable values to strings.
- If 200/201: tighten validation rules for `contact_number` and `availability`.

### Login Test (Valid)
Purpose: Confirm `POST /api/v1/auth/login` returns access/refresh tokens.

Command:
```bash
curl --max-time 20 -sS -X POST \
  "https://backend-blood-donor-api.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_number": "09171234567"
  }' -w "\nSTATUS:%{http_code}\n"
```

Expected:
- HTTP 200
- Response includes `access_token`, `refresh_token`, `token_type`

Possible Errors:
- `401 Unauthorized`
- `404 Not Found` (if user not created)
- `500 Internal database error`

How to Solve:
- If 401/404: confirm registration created a user record or auto-provisions users on first login.
- If 500: check auth dependencies, DB queries, and token generation.
- If 422: validate request body fields (`contact_number` required, string format).

### Login Test (Invalid Data -> 422)
Purpose: Ensure invalid login data yields validation errors.

Command:
```bash
curl --max-time 20 -sS -X POST \
  "https://backend-blood-donor-api.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_number": 12345
  }' -w "\nSTATUS:%{http_code}\n"
```

Expected:
- HTTP 422
- Error JSON should be well-formed

How to Solve If It Fails:
- If 500: check validation exception handler serialization logic.
- If 200: enforce stricter type checks on login request model.
