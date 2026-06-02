import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAl50PUxncpZd3FCKrxoSznr3bmQSBPtrk",
  authDomain: "icafe-add1f.firebaseapp.com",
  projectId: "icafe-add1f",
  storageBucket: "icafe-add1f.firebasestorage.app",
  messagingSenderId: "534641100622",
  appId: "1:534641100622:web:e01ac1b3e3fafdfc31401f",
  measurementId: "G-29NQ4XSRML",
};

// Prevent re-initialization during hot reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
