3️⃣ Donor Registration Screen (Offline-First with Turso Sync)
🎯 Goal

Allow voluntary donors to register with or without internet access, using local storage for offline access and Turso as the permanent database once online.

🏗️ Architecture
React Native
├─ AsyncStorage / SQLite (offline storage)
└─ Sync Service
↓ (when online)
Backend API
↓
Turso Database

🧾 Fields to Include

Full Name

Age

Sex

Male

Female

Blood Type

A+, A-, B+, B-, AB+, AB-, O+, O-

Contact Number

Municipality

Dropdown (Sorsogon municipalities only)

Availability Status

Available

Temporarily Unavailable

🛠️ TODO
1️⃣ Create Registration Form (React Native)

Use TextInput for:

Full Name

Age

Contact Number

Use Picker / Dropdown for:

Blood Type

Municipality

Use Radio Buttons for:

Sex

Availability Status

Add Submit Button

2️⃣ Add Form Validation

Age:

Must be numeric

Must be greater than 0

Contact Number:

Must follow PH format (e.g. 09XXXXXXXXX)

Required fields must not be empty

Prevent submission if validation fails

3️⃣ Save Donor Data Locally (Offline Mode)

On submit:

Save donor data to AsyncStorage or local SQLite

Include sync metadata:

{
"synced": false,
"created_at": "timestamp"
}

App must work without internet connection

❌ Do NOT send data directly to Turso from the app

4️⃣ Sync Service (Online Mode)

Detect internet availability

When online:

Retrieve all locally saved donor records with synced = false

Send records to Backend API

Backend:

Validates data

Stores donor records in Turso database

On successful sync:

Mark local record as synced = true

Or remove it from local storage

5️⃣ User Feedback

On successful local save:

Show message:
“Thank you for registering as a voluntary donor!”

If offline:

Show note:
“Your data has been saved and will be uploaded once internet is available.”

If sync fails:

Keep data locally and retry later

🗄️ Notes

Local storage is temporary and used for offline access only

Turso is the single source of truth

Backend API handles:

Security

Validation

Duplicate checks (optional: contact number)
