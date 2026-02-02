You are working on a React Native (Expo) mobile application. Improve the donor registration and dashboard flow with the following requirements:

1️⃣ Donor Registration Storage

In @app/register.tsx, after a donor successfully registers, store the donor’s information locally on the device.

Since this is React Native, do NOT use browser localStorage.
Instead, use AsyncStorage from:

import AsyncStorage from '@react-native-async-storage/async-storage';

Store the following donor details as a single object:

Full Name

Age

Sex

Blood Type

Contact Number

Municipality (within Sorsogon Province)

Save it using a clear key like:
"donorProfile"

2️⃣ Donor Dashboard Screen

Create a separate screen called something like:

DonorDashboard.tsx

This screen must:

Retrieve the saved donor data from AsyncStorage

Display only that donor’s personal information

Show the data in a clean, readable layout (labels + values)

Example sections to display:

Donor Information

Full Name

Age

Sex

Blood Type

Contact Number

Municipality

3️⃣ Navigation Flow

After successful registration:

Automatically navigate the donor to the Donor Dashboard screen

On app reload, if "donorProfile" exists in AsyncStorage, the app should be able to use it to identify the donor session (basic local persistence only — no backend auth)

4️⃣ Scope Restrictions

This dashboard must show ONLY the logged-in donor’s own data.
Do not add:

Other donors

Blood requests list

Admin features

Medical records

This dashboard is strictly for viewing the registered donor’s personal profile information.

Use React Native functional components, hooks, and proper AsyncStorage async/await handling.
