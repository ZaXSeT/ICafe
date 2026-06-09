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
import { Order, OrderItem, CartItem, OrderStatus } from '../types';

const COLLECTION = 'orders';

function toOrder(id: string, data: any): Order {
    return {
        id,
        userId: data.userId ?? '',
        items: data.items ?? [],
        subtotal: data.subtotal ?? 0,
        total: data.total ?? 0,
        status: data.status ?? 'pending',
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        tableNumber: data.tableNumber,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    };
}

export async function createOrder(
    userId: string,
    cartItems: CartItem[],
    notes?: string,
    tableNumber?: number
): Promise<string> {
    const items: OrderItem[] = cartItems.map((ci) => ({
        menuItemId: ci.menuItem.id,
        name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        notes: ci.notes,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal; // Add tax/service charge here if needed

    const orderData = {
        userId,
        items,
        subtotal,
        total,
        status: 'pending' as OrderStatus,
        notes,
        tableNumber,
        paymentMethod: 'cash',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, COLLECTION), orderData);
    return ref.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => toOrder(d.id, d.data()));
    } catch (error) {
        console.error('Error fetching orders:', error);
        // Fallback without orderBy
        try {
            const q = query(collection(db, COLLECTION), where('userId', '==', userId));
            const snap = await getDocs(q);
            const orders = snap.docs.map((d) => toOrder(d.id, d.data()));
            return orders.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
        } catch (e) {
            return [];
        }
    }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const snap = await getDoc(doc(db, COLLECTION, orderId));
        if (!snap.exists()) return null;
        return toOrder(snap.id, snap.data());
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

export async function cancelOrder(orderId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, orderId), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
    });
}
