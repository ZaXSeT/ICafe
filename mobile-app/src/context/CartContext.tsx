import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { CartItem, MenuItem } from '../types';

interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; notes?: string } }
    | { type: 'REMOVE_ITEM'; payload: { menuItemId: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: string; quantity: number } }
    | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { menuItem, notes } = action.payload;
            const existing = state.items.find((i) => i.menuItem.id === menuItem.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.menuItem.id === menuItem.id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, { menuItem, quantity: 1, notes }],
            };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter((i) => i.menuItem.id !== action.payload.menuItemId),
            };
        case 'UPDATE_QUANTITY': {
            const { menuItemId, quantity } = action.payload;
            if (quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((i) => i.menuItem.id !== menuItemId),
                };
            }
            return {
                ...state,
                items: state.items.map((i) =>
                    i.menuItem.id === menuItemId ? { ...i, quantity } : i
                ),
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (menuItem: MenuItem, notes?: string) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    clearCart: () => void;
    getItemQuantity: (menuItemId: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    const addItem = useCallback((menuItem: MenuItem, notes?: string) => {
        dispatch({ type: 'ADD_ITEM', payload: { menuItem, notes } });
    }, []);

    const removeItem = useCallback((menuItemId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId } });
    }, []);

    const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const getItemQuantity = useCallback(
        (menuItemId: string) =>
            state.items.find((i) => i.menuItem.id === menuItemId)?.quantity ?? 0,
        [state.items]
    );

    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.items.reduce(
        (sum, i) => sum + i.menuItem.price * i.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                itemCount,
                subtotal,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                getItemQuantity,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
