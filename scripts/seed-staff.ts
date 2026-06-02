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
    
    // Check and seed owner
    const ownerQuery = await staffRef.where("role", "==", "OWNER").get();
    if (ownerQuery.empty) {
      const defaultOwner = {
        name: "Admin Owner",
        pin: "123456",
        role: "OWNER",
        createdAt: new Date(),
      };
      const docRef = await staffRef.add(defaultOwner);
      console.log(`Created Owner account with ID: ${docRef.id} and PIN: 123456`);
    } else {
      console.log("Owner account already exists.");
    }

    // Check and seed cashier
    const cashierQuery = await staffRef.where("pin", "==", "118282").get();
    if (cashierQuery.empty) {
      const defaultCashier = {
        name: "Cashier 1",
        pin: "118282",
        role: "CASHIER",
        createdAt: new Date(),
      };
      const docRef2 = await staffRef.add(defaultCashier);
      console.log(`Created Cashier account with ID: ${docRef2.id} and PIN: 118282`);
    } else {
      console.log("Cashier account already exists.");
    }
  } catch (error) {
    console.error("Error seeding staff:", error);
  }
}

seedStaff().then(() => process.exit(0));
