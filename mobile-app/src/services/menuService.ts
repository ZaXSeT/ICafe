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
import { MenuItem } from '../types';

function toMenuItem(id: string, categoryId: string, categoryName: string, data: any): MenuItem {
    return {
        id,
        name: data.name ?? '',
        description: data.description ?? '',
        price: data.price ?? 0,
        // Map the category to the category's name so UI can filter by it
        category: categoryName, 
        imageUrl: data.imageUrl ?? data.image ?? undefined,
        available: data.isAvailable ?? data.available !== false,
        featured: data.featured ?? false,
        tags: data.tags ?? [],
        createdAt: data.createdAt?.toDate?.() ?? undefined,
        updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    };
}

export async function getMenuItems(categoryIdOrName?: string): Promise<MenuItem[]> {
    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        let allItems: MenuItem[] = [];

        for (const catDoc of categoriesSnapshot.docs) {
            const catData = catDoc.data();
            const catId = catDoc.id;
            const catName = catData.name;

            // If a specific category was requested and this isn't it, skip
            if (categoryIdOrName && categoryIdOrName !== 'all' && catName !== categoryIdOrName && catId !== categoryIdOrName) {
                continue;
            }

            const itemsRef = collection(db, 'categories', catId, 'menuItems');
            const itemsQuery = query(itemsRef, where('isAvailable', '==', true));
            const itemsSnapshot = await getDocs(itemsQuery);
            
            const categoryItems = itemsSnapshot.docs.map(doc => 
                toMenuItem(doc.id, catId, catName, doc.data())
            );
            
            allItems = [...allItems, ...categoryItems];
        }

        return allItems.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
}

export async function getFeaturedMenuItems(): Promise<MenuItem[]> {
    // Just fetch all and take the first few, since cross-collection queries for 'featured' requires a collectionGroup index
    try {
        const items = await getMenuItems();
        return items.filter(i => i.featured).slice(0, 5); // Return up to 5 featured items
    } catch (error) {
        console.error('Error fetching featured items:', error);
        return [];
    }
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
    // This is expensive without knowing the category. We have to search all categories.
    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        for (const catDoc of categoriesSnapshot.docs) {
            const snap = await getDoc(doc(db, 'categories', catDoc.id, 'menuItems', id));
            if (snap.exists()) {
                return toMenuItem(snap.id, catDoc.id, catDoc.data().name, snap.data());
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return null;
    }
}
