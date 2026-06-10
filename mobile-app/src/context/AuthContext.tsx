import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateUserProfile: (displayName: string, photoUrl?: string) => Promise<void>;
    toggleFavorite: (itemId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (uid: string) => {
        try {
            const ref = doc(db, 'users', uid);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setUserProfile({ uid, ...snap.data() } as UserProfile);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await fetchUserProfile(firebaseUser.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        const profileData: Omit<UserProfile, 'uid'> = {
            email,
            displayName,
            role: 'customer',
            favoriteItems: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), {
            ...profileData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    };

    const logout = async () => {
        await signOut(auth);
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchUserProfile(user.uid);
        }
    };

    const updateUserProfile = async (displayName: string, photoUrl?: string) => {
        if (!user) return;
        await updateProfile(user, { displayName, photoURL: photoUrl || user.photoURL });
        const ref = doc(db, 'users', user.uid);
        await setDoc(ref, { displayName, photoURL: photoUrl || user.photoURL, updatedAt: serverTimestamp() }, { merge: true });
        await fetchUserProfile(user.uid);
    };

    const toggleFavorite = async (itemId: string) => {
        if (!user) return;
        const currentFavorites = userProfile?.favoriteItems || [];
        const isFavorite = currentFavorites.includes(itemId);
        const newFavorites = isFavorite
            ? currentFavorites.filter(id => id !== itemId)
            : [...currentFavorites, itemId];
        
        const ref = doc(db, 'users', user.uid);
        await setDoc(ref, { favoriteItems: newFavorites, updatedAt: serverTimestamp() }, { merge: true });
        
        if (userProfile) {
            setUserProfile({ ...userProfile, favoriteItems: newFavorites });
        } else {
            await fetchUserProfile(user.uid);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                loading,
                signIn,
                signUp,
                logout,
                resetPassword,
                refreshProfile,
                updateUserProfile,
                toggleFavorite,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
