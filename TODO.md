DUGTONG React Native App – Development TODO List
1️⃣ Welcome / Landing Screen

Goal: Introduce the app and guide users to main actions.

TODO:

Create WelcomeScreen.js

Add:

App logo/title: DUGTONG – Dugo Ko, Tulong Ko

Short description:
“A blood donor profiling and management system for Sorsogon Province.”

Buttons:

Find a Donor

Register as Donor

Login (Authorized Personnel Only)

Use a clean medical theme (red + white accents)

Make layout responsive using SafeAreaView, ScrollView

2️⃣ Navigation Setup

Goal: Organize app flow.

TODO:

Login page: edit the login.tsx add a form to that using the full name and contact number found in register.tsx add also a default dummy data in that login page that redirect to dashboard for testing purpose.

Dashboard (Authorized Users)

Donor Profile Details

Edit Donor Profile

3️⃣ Donor Registration Screen

Goal: Allow voluntary donors to register.

Fields to include (based on scope):

Full Name

Age

Sex (Male / Female)

Blood Type (A+, A-, B+, B-, AB+, AB-, O+, O-)

Contact Number

Municipality (Dropdown – Sorsogon municipalities only)

Availability Status:

Available

Temporarily Unavailable

TODO:

Create form using TextInput, Picker/Dropdown, Radio Buttons

Add form validation:

Age must be number

Contact number format check

Required fields cannot be empty

Submit button → Send data to localStorage only and session

Show success message: “Thank you for registering as a voluntary donor!”

4️⃣ Donor Search Screen (For Patients & Staff)

Goal: Search donors by blood type and location.

TODO:

Filters:

Blood Type (required)

Municipality (optional)

Availability Status (Available only by default)

Search button triggers API request

Display results in a FlatList

Each donor card shows:

Name

Blood Type

Municipality

Availability Status

Tap card → Go to Donor Profile Details Screen

5️⃣ Donor Profile Details Screen

Goal: View full donor information.

Display:

Full Name

Age

Sex

Blood Type

Contact Number

Municipality

Availability Status

Buttons (based on role):

For general users:

Request Contact (simulated notification only)

For authorized personnel:

Edit Profile

Update Availability

6️⃣ Login Screen (Authorized Personnel Only)

Goal: Secure access for hospitals & health offices.

TODO:

Fields:

Email / Username

Password

Backend authentication using JWT

On success → Navigate to Dashboard

On failure → Show error message

7️⃣ Authorized Personnel Dashboard

Goal: Manage donor records.

Tabs or Sections:

All Donors

Add Donor (Manual encoding)

Reports (Basic statistics)

8️⃣ Add Donor (Manual Encoding by Staff)

Goal: Staff can encode donor data manually.

Same fields as Donor Registration, plus:

Notes (optional)

TODO:

Reusable form component

Submit to database

Redirect back to donor list

9️⃣ Edit / Update Donor Profile

Goal: Authorized users can update donor info.

Editable Fields:

Contact Number

Municipality

Availability Status

TODO:

Pre-fill existing data

PUT request to backend

Show confirmation alert

🔟 Donor Availability Toggle

Goal: Quickly mark donors as available/unavailable.

TODO:

Add toggle switch in profile

PATCH request to update availabilityStatus

Reflect change in search results

1️⃣1️⃣ Notification Feature (Basic)

Goal: Simulate notifying donors.

Scope-friendly (no real SMS integration):

Button: Notify Donor

Log notification request in database

Show message: “Notification request recorded.”

1️⃣2️⃣ Backend Connection Setup

Goal: Connect app to Node.js + Express + MongoDB.

TODO:

Create API base service file (api.js)

Use axios or fetch

Endpoints:

POST /donors

GET /donors

GET /donors/:id

PUT /donors/:id

PATCH /donors/:id/availability

POST /auth/login

1️⃣3️⃣ Data Model (MongoDB)

Donor Schema Fields:

name

age

sex

bloodType

contactNumber

municipality

availabilityStatus

dateRegistered

1️⃣4️⃣ Search Optimization

Goal: Make searching fast and usable.

TODO:

Add query parameters:

?bloodType=O+&municipality=Bulan&available=true

Backend filtering logic

Show “No donors found” state

1️⃣5️⃣ Basic Reports Screen (For Study Data)

Goal: Support study’s statistical analysis.

Show:

Total donors

Donors per blood type

Donors per municipality

Available vs Unavailable counts

(Just simple counts from backend)

1️⃣6️⃣ UI/UX Consistency

TODO:

Use consistent color palette (Red = blood theme)

Reusable components:

FormInput

DonorCard

PrimaryButton

Add loading indicators during API calls

1️⃣7️⃣ Error Handling

TODO:

Handle:

No internet

Server down

Empty results

Show user-friendly alerts

1️⃣8️⃣ Role-Based Access Control

Goal: Limit features properly.

Feature Public User Authorized Personnel
Search Donors ✅ ✅
View Donor ✅ ✅
Register Donor ✅ ✅ (manual add)
Edit Donor ❌ ✅
View Reports ❌ ✅
1️⃣9️⃣ Testing Phase

TODO:

Test:

Registration flow

Search accuracy

Login security

Editing donor data

Use sample encoded donor data only

2️⃣0️⃣ Final Limitations (Keep Within Scope)

🚫 Do NOT include:

Blood testing data

Medical history

Hospital records

Blood storage tracking

Real SMS integration

National system integration
