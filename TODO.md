# TODO

- [ ] Add seed data for donors, notifications, and reports
- [ ] Add admin management UI for registrations and alerts
- [ ] Add local analytics snapshots for reports
      In @app/components/dashboard/StatsGrid.tsx, update only the Contact Modal and Message Modal to have a modern, clean, and mobile-friendly UI (smooth spacing, refined typography, subtle animations if needed).

Functional requirements:

When the user taps Message inside the Message Modal, automatically open the device’s default messaging app, with the phone number dynamically passed from the modal.

When the user taps Call inside the Contact Modal, redirect to the device’s default phone/contacts app, using the same phone number provided by the modal.

Strict constraints:

❌ Do NOT modify, refactor, or remove any existing design, layout, styles, state, or logic outside of these two modals.

❌ Do NOT change existing business logic or component behavior unrelated to this task.

✅ Use platform-appropriate APIs (e.g., React Native Linking) and follow real-world mobile application standards.

The final implementation must be fully functional on mobile devices, maintain existing behavior, and integrate seamlessly with the current codebase.
