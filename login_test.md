# Login API Test Notes

**Date:** 2026-02-15
**Environment:** https://dugtung-next.vercel.app
**Method:** Executed `node /home/jobel/projects/app-project/test_api.js` from the workspace.

## Observed Result (Current Environment)

- The test script returned `Status: undefined` and `Body: undefined` for all login attempts.
- This indicates the requests did not receive a network response in the current sandbox environment.
- No backend payload was received during this run.

## Expected Login Response (Per App Contract)

From `routes.md` and `api/auth.ts`, the app expects the login endpoint to return the following shape:

```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "token_type": "bearer",
  "user": {
    "id": "1",
    "role": "admin|donor|hospital_staff|health_officer",
    "name": "Full Name",
    "contact_number": "09123456789",
    "email": "optional@email.com",
    "avatar_url": "optional_url"
  }
}
```

## Next Step To Capture Real Backend Data

Re-run `node /home/jobel/projects/app-project/test_api.js` in an environment with outbound network access to capture the actual backend response payload. The script already prints the login response body, which should be copied here.
