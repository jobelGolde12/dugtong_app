const fetch = require('node-fetch');

async function testFrontendConnection() {
    const API_BASE_URL = "https://dugtung-next.vercel.app/api";

    console.log(`Testing connection to: ${API_BASE_URL}`);

    // Test 1: Register (Donor Registration Flow)
    console.log("\n1. Testing /donor-registrations...");
    const regPayload = {
        "full_name": "Test Frontend User",
        "age": 30,
        "sex": "Male",
        "blood_type": "O+",
        "contact_number": "09" + Math.floor(Math.random() * 1000000000),
        "municipality": "Quezon City",
        "availability_status": "Available"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/donor-registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(regPayload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Response Body:", text);

        if (!response.ok) {
            console.error("❌ Registration Failed");
        } else {
            console.log("✅ Registration Success");
            const data = JSON.parse(text);

            // Test 2: Login (Contact Flow) with the created user
            console.log("\n2. Testing /auth/login with created user...");
            const loginPayload = {
                "full_name": regPayload.full_name,
                "contact_number": regPayload.contact_number
            };

            const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginPayload)
            });

            console.log(`Status: ${loginResponse.status} ${loginResponse.statusText}`);
            const loginText = await loginResponse.text();
            console.log("Login Response Body:", loginText);

            if (!loginResponse.ok) {
                console.error("❌ Login Failed");
            } else {
                console.log("✅ Login Success");
            }
        }

    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

testFrontendConnection();
