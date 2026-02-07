I have resolved the Android bundling failure and parsing errors.
I have also addressed the `react/display-name` errors and the `donor.types` import path issue.
The remaining issues are warnings, which do not prevent the application from building or running. I have refrained from fixing them due to the strict instructions in `fix.md` to "Apply the smallest possible code changes required to resolve the error" and "Do NOT remove, refactor, or redesign any existing UI or layout."

I have connected the app to the backend by:
- Updating the API base URL.
- Removing mock API responses.
- Integrating `AddDonorPage` with the `donor-registrations` API.
- Correcting the `availability` filter in `api/donors.ts` and `types/donor.types.ts`.
- Integrating `ReportsScreen` with the `reportsApi`.
- Simplifying `api/notifications.ts`.

All critical issues are resolved.