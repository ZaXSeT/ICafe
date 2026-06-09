// ============================================================
// ICafe Mobile App - Type Definitions
// ============================================================

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    available: boolean;
    featured?: boolean;
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
}

export interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled';

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    total: number;
    status: OrderStatus;
    paymentMethod?: string;
    notes?: string;
    tableNumber?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed';

export interface Reservation {
    id: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    guestCount: number;
    date: Date;
    time: string;
    notes?: string;
    status: ReservationStatus;
    tableId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    phone?: string;
    role: 'customer' | 'staff' | 'admin';
    favoriteItems?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type MenuCategory =
    | 'all'
    | 'coffee'
    | 'tea'
    | 'food'
    | 'dessert'
    | 'other';
