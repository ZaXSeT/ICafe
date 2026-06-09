import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MenuItem, MenuCategory } from '../types';

const COLLECTION = 'menuItems';

function toMenuItem(id: string, data: any): MenuItem {
    return {
        id,
        name: data.name ?? '',
        description: data.description ?? '',
        price: data.price ?? 0,
        category: data.category ?? 'other',
        imageUrl: data.imageUrl ?? data.image ?? undefined,
        available: data.available !== false,
        featured: data.featured ?? false,
        tags: data.tags ?? [],
        createdAt: data.createdAt?.toDate?.() ?? undefined,
        updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    };
}

export async function getMenuItems(category?: MenuCategory): Promise<MenuItem[]> {
    try {
        let q;
        if (category && category !== 'all') {
            q = query(
                collection(db, COLLECTION),
                where('available', '==', true),
                where('category', '==', category),
                orderBy('name')
            );
        } else {
            q = query(
                collection(db, COLLECTION),
                where('available', '==', true),
                orderBy('name')
            );
        }
        const snap = await getDocs(q);
        return snap.docs.map((d) => toMenuItem(d.id, d.data()));
    } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback: try without orderBy if index doesn't exist
        try {
            const snap = await getDocs(collection(db, COLLECTION));
            const items = snap.docs.map((d) => toMenuItem(d.id, d.data()));
            const available = items.filter((i) => i.available);
            if (category && category !== 'all') {
                return available.filter((i) => i.category === category);
            }
            return available;
        } catch (e) {
            console.error('Fallback fetch failed:', e);
            return [];
        }
    }
}

export async function getFeaturedMenuItems(): Promise<MenuItem[]> {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('available', '==', true),
            where('featured', '==', true)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => toMenuItem(d.id, d.data()));
    } catch (error) {
        console.error('Error fetching featured items:', error);
        return [];
    }
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
        const snap = await getDoc(doc(db, COLLECTION, id));
        if (!snap.exists()) return null;
        return toMenuItem(snap.id, snap.data());
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return null;
    }
}
