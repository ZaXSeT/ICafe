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

// The website's Admin Dashboard reads from pos_orders
const COLLECTION = 'pos_orders';

function toOrder(id: string, data: any): Order {
    return {
        id,
        userId: data.userId ?? '',
        items: data.items ?? data.order ?? [], // Admin dashboard saves items as `order`
        subtotal: data.subtotal ?? 0,
        total: data.total ?? 0,
        status: (data.status?.toLowerCase() || 'pending') as OrderStatus,
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
    tableNumber?: string | number
): Promise<string> {
    const items: OrderItem[] = cartItems.map((ci) => ({
        menuItemId: ci.menuItem.id,
        name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        notes: ci.notes,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal;

    const orderData = {
        userId,
        order: items, // Save as `order` so the website admin dashboard can read it
        subtotal,
        total,
        // The admin dashboard expects uppercase statuses like IN_PROGRESS or PENDING
        status: tableNumber === 'Takeaway' ? 'COMPLETED' : 'IN_PROGRESS',
        notes: notes || '',
        tableNumber: tableNumber || 'Takeaway',
        paymentMethod: 'Cash',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'ONLINE_APP', // To distinguish it from POS in the admin dashboard if needed
    };

    const ref = await addDoc(collection(db, COLLECTION), orderData);
    return ref.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
    try {
        const q = query(collection(db, COLLECTION), where('userId', '==', userId));
        const snap = await getDocs(q);
        const orders = snap.docs.map((d) => toOrder(d.id, d.data()));
        return orders.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
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
        status: 'CANCELLED',
        updatedAt: serverTimestamp(),
    });
}
