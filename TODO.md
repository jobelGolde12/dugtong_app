You are working on an existing React Native + TypeScript application.

Task Overview

Add a new navigation link called "Map" in the file:

@app/components/DashboardLayout.tsx

This new link must navigate to a new page/screen called:

Blood Donation Map

Detailed Requirements

Dashboard Layout Update

Add a new navigation item labeled "Map".

Ensure it follows the same styling and navigation pattern as the existing links.

The link must route correctly to the new Blood Donation Map screen.

Create Blood Donation Map Page

Create a new screen/page component for Blood Donation Map.

Use TypeScript and follow the project’s existing screen/component structure.

The screen title should clearly display:
Blood Donation Map

Google Map Integration

Embed a Google Map in the Blood Donation Map screen.

The map must be centered on:

Sorsogon City, Philippines

Use proper React Native map embedding (e.g., WebView with Google Maps embed OR react-native-maps if already installed).

Set an appropriate zoom level so Sorsogon City is clearly visible.

Navigation & Routing

Ensure the new screen is properly registered in the app’s navigation system.

Verify that tapping Map from the dashboard successfully opens the Blood Donation Map screen.

Code Quality

Use TypeScript types.

Match existing project patterns and conventions.

Do not break existing navigation or layouts.

Expected Output

Updated DashboardLayout.tsx with a new Map link.

A new Blood Donation Map screen/page.

Working embedded Google Map focused on Sorsogon City.

Fully functional navigation between Dashboard and Map screen.
