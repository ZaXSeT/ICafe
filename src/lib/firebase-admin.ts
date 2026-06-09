import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin SDK uses service account credentials for server-side operations.
// For development, we use the project ID with Application Default Credentials.
// For production, set FIREBASE_SERVICE_ACCOUNT_KEY env var with the JSON key.

function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }

  // Use individual env vars if available (from .env.local or Vercel)
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    // Handle literal \n or double quotes that might be injected by env parsers
    let formattedKey = privateKey.replace(/\\n/g, '\n');
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      formattedKey = formattedKey.slice(1, -1);
    }

    return initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedKey,
      }),
    });
  }

  // Fallback: use project ID only (works with Firebase emulator or when
  // GOOGLE_APPLICATION_CREDENTIALS env var is set)
  return initializeApp({
    projectId: projectId || "icafe-add1f",
  });
}

const app = initAdmin();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
