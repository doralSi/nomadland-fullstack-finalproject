// Create and test admin user
const BASE_URL = "http://localhost:5000/api/auth";

async function createAndTestAdmin() {
  console.log("\n=== Creating Admin User ===");
  
  // First register a new admin user
  try {
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123"
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log("Admin user registered:", registerData.user.email);
      console.log("\nNOTE: You must manually update this user's role to 'admin' in MongoDB:");
      console.log("db.users.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } })");
      console.log("\nAfter updating, login and test the admin endpoint.");
    } else {
      // User might already exist, try to login
      console.log("User may already exist. Attempting login...");
      
      const loginResponse = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "admin123"
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const adminToken = loginData.token;
        console.log("Login successful! Testing admin endpoint...\n");
        
        // Test admin endpoint
        const adminResponse = await fetch(`${BASE_URL}/admin`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`
          }
        });
        
        const adminData = await adminResponse.json();
        console.log("=== Admin Token Test Result ===");
        console.log("Status:", adminResponse.status);
        console.log("Response:", JSON.stringify(adminData, null, 2));
      } else {
        console.log("Could not login with admin@example.com");
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

createAndTestAdmin();
