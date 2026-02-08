import { createClient } from "@libsql/client";

const databaseUrl =
  process.env.EXPO_PUBLIC_TURSO_DATABASE_URL ||
  process.env.TURSO_DATABASE_URL;

const authToken =
  process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN ||
  process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("Missing EXPO_PUBLIC_TURSO_DATABASE_URL or TURSO_DATABASE_URL");
  process.exit(1);
}

const client = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

const donors = [
  {
    full_name: "Maria Luisa Rivera",
    age: 29,
    sex: "F",
    blood_type: "O+",
    contact_number: "09171234567",
    municipality: "Sorsogon City",
    availability_status: "Available",
    last_donation_date: "2025-12-18",
    notes: "Works at Sorsogon Provincial Hospital. Available weekends.",
  },
  {
    full_name: "John Michael Santos",
    age: 35,
    sex: "M",
    blood_type: "A+",
    contact_number: "09281239876",
    municipality: "Bulan",
    availability_status: "Temporarily Unavailable",
    last_donation_date: "2025-11-05",
    notes: "Recovering from dengue. Expected to be available in March.",
  },
  {
    full_name: "Ana Clara Villanueva",
    age: 24,
    sex: "F",
    blood_type: "B+",
    contact_number: "09183456789",
    municipality: "Gubat",
    availability_status: "Available",
    last_donation_date: "2025-10-09",
    notes: "Community health volunteer, prefers morning schedules.",
  },
  {
    full_name: "Ramon Vicente De la Cruz",
    age: 41,
    sex: "M",
    blood_type: "AB+",
    contact_number: "09981234567",
    municipality: "Irosin",
    availability_status: "Available",
    last_donation_date: "2025-12-02",
    notes: "Available on short notice, owns transport.",
  },
  {
    full_name: "Kristine Mae Gonzales",
    age: 31,
    sex: "F",
    blood_type: "O-",
    contact_number: "09391234567",
    municipality: "Barcelona",
    availability_status: "Available",
    last_donation_date: "2025-09-15",
    notes: "Rare blood type. Prefers coordinated schedules.",
  },
  {
    full_name: "Noel Patrick Mendoza",
    age: 27,
    sex: "M",
    blood_type: "A-",
    contact_number: "09061234567",
    municipality: "Matnog",
    availability_status: "Temporarily Unavailable",
    last_donation_date: "2025-12-30",
    notes: "Recently donated for emergency. Next eligible in April.",
  },
  {
    full_name: "Clarisse Joy Bautista",
    age: 22,
    sex: "F",
    blood_type: "B-",
    contact_number: "09221234567",
    municipality: "Pili",
    availability_status: "Available",
    last_donation_date: "2025-08-21",
    notes: "University student. Prefers weekday afternoons.",
  },
  {
    full_name: "Enrique Lorenzo Magtibay",
    age: 38,
    sex: "M",
    blood_type: "O+",
    contact_number: "09195551234",
    municipality: "Casiguran",
    availability_status: "Available",
    last_donation_date: "2025-11-20",
    notes: "Barangay responder with previous donor drive experience.",
  },
];

const notifications = [
  {
    title: "Urgent O- Request",
    message: "Sorsogon Provincial Hospital needs O- units for a trauma case. Please respond if available today.",
    type: "Emergency",
    is_read: 0,
    created_at: "2026-02-07T08:45:00Z",
    data: { municipality: "Sorsogon City", bloodType: "O-" },
  },
  {
    title: "Donation Drive Update",
    message: "Mobile blood drive scheduled in Gubat Municipal Hall on Feb 15, 9:00 AM. Walk-ins welcome.",
    type: "Update",
    is_read: 0,
    created_at: "2026-02-06T03:10:00Z",
    data: { municipality: "Gubat", schedule: "2026-02-15T09:00:00Z" },
  },
  {
    title: "Eligibility Reminder",
    message: "You are eligible to donate again. Please update your availability status in the app.",
    type: "Reminder",
    is_read: 1,
    created_at: "2026-02-02T10:05:00Z",
    data: { action: "update_availability" },
  },
  {
    title: "System Maintenance",
    message: "Scheduled maintenance on Feb 12, 11:00 PM - Feb 13, 1:00 AM. Some features may be unavailable.",
    type: "System",
    is_read: 0,
    created_at: "2026-02-05T14:30:00Z",
    data: { window: "2026-02-12T23:00:00Z" },
  },
  {
    title: "AB+ Donor Match",
    message: "AB+ donor needed in Irosin for a scheduled surgery. Please confirm availability this week.",
    type: "Update",
    is_read: 0,
    created_at: "2026-02-03T07:20:00Z",
    data: { municipality: "Irosin", bloodType: "AB+" },
  },
];

const insertDonors = async () => {
  for (const donor of donors) {
    await client.execute({
      sql: `INSERT INTO donors (
        full_name,
        age,
        sex,
        blood_type,
        contact_number,
        municipality,
        availability_status,
        last_donation_date,
        notes,
        created_at,
        is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
      ,
      args: [
        donor.full_name,
        donor.age,
        donor.sex,
        donor.blood_type,
        donor.contact_number,
        donor.municipality,
        donor.availability_status,
        donor.last_donation_date,
        donor.notes,
        new Date().toISOString(),
      ],
    });
  }
};

const insertNotifications = async () => {
  for (const notification of notifications) {
    await client.execute({
      sql: `INSERT INTO notifications (
        title,
        message,
        type,
        is_read,
        created_at,
        data
      ) VALUES (?, ?, ?, ?, ?, ?)`
      ,
      args: [
        notification.title,
        notification.message,
        notification.type,
        notification.is_read,
        notification.created_at,
        JSON.stringify(notification.data || {}),
      ],
    });
  }
};

await insertDonors();
await insertNotifications();

console.log(`Seeded ${donors.length} donors and ${notifications.length} notifications.`);
