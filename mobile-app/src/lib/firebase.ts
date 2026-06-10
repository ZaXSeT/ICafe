import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
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

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
