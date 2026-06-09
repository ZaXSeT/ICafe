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
        status: data.status ?? 'pending',
        tableId: data.tableId,
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
}

export async function createReservation(data: CreateReservationData): Promise<string> {
    const resData = {
        ...data,
        date: data.date,
        status: 'pending' as ReservationStatus,
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
            orderBy('date', 'desc')
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
                (a, b) => b.date.getTime() - a.date.getTime()
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
        status: 'cancelled',
        updatedAt: serverTimestamp(),
    });
}
