# Registration API Test (Post-Fix)

## Purpose
Verify that the validation exception handler no longer crashes on non-JSON
serializable `ValueError` objects in the `ctx` field and that the registration
endpoint returns correct 422 and 201 responses.

## Endpoint
`POST /api/v1/donor-registrations`

Base URL:
`https://backend-blood-donor-api.onrender.com`

## Test Cases

1. Invalid availability value (expect 422)
   - This should produce a validation error with a `ctx` that includes a
     `ValueError` object, which must now serialize correctly.

   ```bash
   curl -sS -X POST \
     "https://backend-blood-donor-api.onrender.com/api/v1/donor-registrations" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Test User",
       "contact_number": "09123456789",
       "age": 30,
       "blood_type": "O+",
       "municipality": "Sorsogon City",
       "availability": "Available"
     }' -w "\nSTATUS:%{http_code}\n"
   ```

   Expected:
   - HTTP 422
   - JSON error response with `detail` array
   - `ctx` values should be strings (no serialization crash)

2. Invalid phone number format (expect 422)
   - Use a clearly invalid contact number to trigger validation.

   ```bash
   curl -sS -X POST \
     "https://backend-blood-donor-api.onrender.com/api/v1/donor-registrations" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Test User",
       "contact_number": "ABC123",
       "age": 30,
       "blood_type": "O+",
       "municipality": "Sorsogon City",
       "availability": "available"
     }' -w "\nSTATUS:%{http_code}\n"
   ```

   Expected:
   - HTTP 422
   - JSON error response with `detail` array

3. Valid registration (expect 201)
   - Should succeed and return a registration record with `status`.

   ```bash
   curl -sS -X POST \
     "https://backend-blood-donor-api.onrender.com/api/v1/donor-registrations" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Test User",
       "contact_number": "09123456789",
       "age": 30,
       "blood_type": "O+",
       "municipality": "Sorsogon City",
       "availability": "available"
     }' -w "\nSTATUS:%{http_code}\n"
   ```

   Expected:
   - HTTP 201
   - JSON response includes: `id`, `status`, `created_at`

4. Unknown fields (expect 201 or 422 depending on validation config)
   - Backend should ignore unknown fields by default (Pydantic).

   ```bash
   curl -sS -X POST \
     "https://backend-blood-donor-api.onrender.com/api/v1/donor-registrations" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Test User",
       "contact_number": "09123456789",
       "age": 30,
       "blood_type": "O+",
       "municipality": "Sorsogon City",
       "availability": "available",
       "sex": "Male",
       "availability_status": "Available"
     }' -w "\nSTATUS:%{http_code}\n"
   ```

   Expected:
   - HTTP 201 if unknown fields are ignored (default)
   - HTTP 422 if validation is strict
