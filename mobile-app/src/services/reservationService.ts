import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Reservation, ReservationStatus } from '../types';

const COLLECTION = 'reservations';

// Map website uppercase statuses back to our lowercase types for internal UI state if needed,
// or just use uppercase strings directly.
function toReservation(id: string, data: any): Reservation {
    return {
        id,
        userId: data.userId ?? '',
        userEmail: data.userEmail,
        userName: data.userName,
        guestCount: data.guestCount ?? 1,
        date: data.date?.toDate?.() ?? new Date(),
        time: data.time ?? '',
        notes: data.notes,
        // The website uses 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
        status: (data.status?.toLowerCase() || 'pending') as ReservationStatus,
        tableId: data.tableId,
        // The website uses tableNumber (string) to show on the admin dashboard
        tableNumber: data.tableNumber, 
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    };
}

export interface CreateReservationData {
    userId: string;
    userEmail: string;
    userName: string;
    guestCount: number;
    date: Date;
    time: string;
    notes?: string;
    // Add tableNumber if available during booking
    tableNumber?: string;
}

export async function createReservation(data: CreateReservationData): Promise<string> {
    const resData = {
        ...data,
        date: data.date,
        // Match the website's expected status and type formats
        status: 'PENDING',
        type: 'ONLINE', // Tells the admin dashboard it's an online reservation
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, COLLECTION), resData);
    return ref.id;
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc') // Use createdAt instead of date to match admin dashboard sorting
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => toReservation(d.id, d.data()));
    } catch (error) {
        console.error('Error fetching reservations:', error);
        // Fallback without orderBy
        try {
            const q = query(
                collection(db, COLLECTION),
                where('userId', '==', userId)
            );
            const snap = await getDocs(q);
            const reservations = snap.docs.map((d) => toReservation(d.id, d.data()));
            return reservations.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
        } catch (e) {
            return [];
        }
    }
}

export async function getReservationById(id: string): Promise<Reservation | null> {
    try {
        const snap = await getDoc(doc(db, COLLECTION, id));
        if (!snap.exists()) return null;
        return toReservation(snap.id, snap.data());
    } catch (error) {
        console.error('Error fetching reservation:', error);
        return null;
    }
}

export async function cancelReservation(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
        status: 'CANCELLED',
        updatedAt: serverTimestamp(),
    });
}
