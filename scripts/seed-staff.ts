const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config({ path: ".env.local" });

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function seedStaff() {
  try {
    const staffRef = db.collection("staff");
    
    // Check if owner already exists
    const ownerQuery = await staffRef.where("role", "==", "OWNER").get();
    if (!ownerQuery.empty) {
      console.log("Owner account already exists.");
      return;
    }

    const defaultOwner = {
      name: "Admin Owner",
      pin: "123456", // Default PIN, should be changed later
      role: "OWNER",
      createdAt: new Date(),
    };

    const docRef = await staffRef.add(defaultOwner);
    console.log(`Created Owner account with ID: ${docRef.id} and PIN: 123456`);
  } catch (error) {
    console.error("Error seeding staff:", error);
  }
}

seedStaff().then(() => process.exit(0));
