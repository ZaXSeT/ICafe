"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL?: string | null;
  role: "CUSTOMER" | "CASHIER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resendVerification: (email: string, password: string) => Promise<void>;
  checkVerification: (email: string, password: string) => Promise<boolean>;
  updateUserProfile: (name: string, photoFile: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            uid: firebaseUser.uid,
            name: data.name || firebaseUser.displayName,
            email: data.email || firebaseUser.email,
            photoURL: data.photoURL || firebaseUser.photoURL,
            role: data.role || "CUSTOMER",
          });
        } else {
          setProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: "CUSTOMER",
          });
        }

        // Store token in cookie for server-side auth
        const token = await firebaseUser.getIdToken();
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
      } else {
        setProfile(null);
        document.cookie =
          "firebase-token=; path=/; max-age=0; SameSite=Lax";
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      // Auto-send verification email
      await sendEmailVerification(cred.user);
      await firebaseSignOut(auth);
      throw { code: "auth/email-not-verified", message: "Please verify your email before signing in. A verification email has been sent." };
    }
    const token = await cred.user.getIdToken();
    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
  };

  const resendVerification = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      await sendEmailVerification(cred.user);
      await firebaseSignOut(auth);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Create user profile in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: "CUSTOMER",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Send verification email
    await sendEmailVerification(cred.user);
    
    // Sign out immediately so they have to verify
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    
    // Check if user document exists, if not create it
    const userDocRef = doc(db, "users", cred.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: cred.user.displayName,
        email: cred.user.email,
        photoURL: cred.user.photoURL,
        role: "CUSTOMER",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    const token = await cred.user.getIdToken();
    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const checkVerification = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred.user.emailVerified) {
      return true;
    } else {
      await firebaseSignOut(auth);
      return false;
    }
  };

  const updateUserProfile = async (name: string, photoFile: File | null) => {
    if (!user) throw new Error("User not authenticated");
    
    let newPhotoURL = profile?.photoURL || user.photoURL || null;

    if (photoFile) {
      const storageRef = ref(storage, `avatars/${user.uid}/${photoFile.name}`);
      await uploadBytes(storageRef, photoFile);
      newPhotoURL = await getDownloadURL(storageRef);
    }

    // Update Auth Profile
    // We import updateProfile inline to avoid circular issues or just use it directly if imported
    const { updateProfile } = await import("firebase/auth");
    await updateProfile(user, { displayName: name, photoURL: newPhotoURL });

    // Update Firestore
    await updateDoc(doc(db, "users", user.uid), {
      name,
      photoURL: newPhotoURL,
      updatedAt: serverTimestamp()
    });

    // Update local state
    setProfile((prev) => prev ? { ...prev, name, photoURL: newPhotoURL } : null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signInWithGoogle, signOut, resendVerification, checkVerification, updateUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
