// קובץ בדיקה לאימות JWT
// הרץ עם: node test-auth.js

const BASE_URL = "http://localhost:5000/api/auth";

// בדיקה 1: הרשמה
async function testRegister() {
  console.log("\n🟢 בקשה 1 — הרשמה");
  console.log("POST", `${BASE_URL}/register`);
  
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dor",
        email: "dor@test.com",
        password: "123456"
      })
    });
    
    const data = await response.json();
    console.log(`סטטוס: ${response.status}`);
    console.log("תשובה:", data);
    
    if (response.ok) {
      return data.token;
    }
  } catch (error) {
    console.error("שגיאה:", error.message);
  }
  
  return null;
}

// בדיקה 2: התחברות
async function testLogin() {
  console.log("\n🟢 בקשה 2 — התחברות");
  console.log("POST", `${BASE_URL}/login`);
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "dor@test.com",
        password: "123456"
      })
    });
    
    const data = await response.json();
    console.log(`סטטוס: ${response.status}`);
    console.log("תשובה:", data);
    
    if (response.ok && data.token) {
      console.log("\n✅ טוקן נשמר:");
      console.log(data.token);
      return data.token;
    }
  } catch (error) {
    console.error("שגיאה:", error.message);
  }
  
  return null;
}

// בדיקה 3: גישה לפרופיל עם טוקן
async function testProfile(token) {
  console.log("\n🟢 בקשה 3 — קבלת פרופיל (route מוגן)");
  console.log("GET", `${BASE_URL}/profile`);
  
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log(`סטטוס: ${response.status}`);
    console.log("תשובה:", data);
    
    if (response.ok) {
      console.log("\n✅ הצלחה! הגישה ל־route המוגן עבדה");
    }
  } catch (error) {
    console.error("שגיאה:", error.message);
  }
}

// הרצת כל הבדיקות
async function runTests() {
  console.log("=".repeat(50));
  console.log("🧪 בודק אימות JWT");
  console.log("=".repeat(50));
  
  // בדיקה 1
  await testRegister();
  
  // בדיקה 2
  const token = await testLogin();
  
  // בדיקה 3
  if (token) {
    await testProfile(token);
  } else {
    console.log("\n❌ לא ניתן לבדוק את הפרופיל בלי טוקן");
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ בדיקות הסתיימו");
  console.log("=".repeat(50));
}

runTests();
