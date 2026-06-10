import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAl50PUxncpZd3FCKrxoSznr3bmQSBPtrk",
  authDomain: "icafe-add1f.firebaseapp.com",
  projectId: "icafe-add1f",
  storageBucket: "icafe-add1f.firebasestorage.app",
  messagingSenderId: "534641100622",
  appId: "1:534641100622:web:e01ac1b3e3fafdfc31401f",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  authInstance = getAuth(app);
}
export const auth = authInstance;

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
