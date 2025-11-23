import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function updateAdminRole() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const result = await mongoose.connection.db.collection("users").updateOne(
      { email: "admin@example.com" },
      { $set: { role: "admin" } }
    );
    
    console.log("Update result:", result);
    
    if (result.modifiedCount > 0) {
      console.log("✅ User role updated to admin");
    } else if (result.matchedCount > 0) {
      console.log("User found but role was already admin");
    } else {
      console.log("❌ User not found");
    }
    
    // Verify the update
    const user = await mongoose.connection.db.collection("users").findOne({ email: "admin@example.com" });
    console.log("Current user:", user);
    
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

updateAdminRole();
