const BASE_URL = "http://localhost:5000/api/auth";

async function testAdminEndpoint() {
  console.log("\n========================================");
  console.log("=== ADMIN ENDPOINT TESTS ===");
  console.log("========================================");
  
  console.log("\n=== Test A: GET /api/auth/admin WITHOUT token ===");
  try {
    const response = await fetch(`${BASE_URL}/admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n=== Test B: GET /api/auth/admin WITH user token (non-admin) ===");
  
  try {
    // Register a test user
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: `testuser${Date.now()}@example.com`,
        password: "password123",
      }),
    });
    const registerData = await registerResponse.json();
    console.log("User registered:", registerData.user?.email);

    // Login to get token
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: registerData.user.email,
        password: "password123",
      }),
    });
    const loginData = await loginResponse.json();
    const userToken = loginData.token;
    console.log("User token obtained");

    // Try to access admin endpoint
    const adminResponse = await fetch(`${BASE_URL}/admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const adminData = await adminResponse.json();
    console.log("Status:", adminResponse.status);
    console.log("Response:", JSON.stringify(adminData, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n=== Test C: GET /api/auth/admin WITH admin token ===");
  
  try {
    // Login with admin credentials
    const adminLoginResponse = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });
    
    if (adminLoginResponse.status === 200) {
      const adminLoginData = await adminLoginResponse.json();
      const adminToken = adminLoginData.token;
      console.log("Admin token obtained");

      // Try to access admin endpoint
      const adminResponse = await fetch(`${BASE_URL}/admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const adminData = await adminResponse.json();
      console.log("Status:", adminResponse.status);
      console.log("Response:", JSON.stringify(adminData, null, 2));
    } else {
      console.log("Could not login with admin credentials");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
  
  console.log("\n========================================");
  console.log("=== ALL TESTS COMPLETED ===");
  console.log("========================================\n");
}

testAdminEndpoint();
