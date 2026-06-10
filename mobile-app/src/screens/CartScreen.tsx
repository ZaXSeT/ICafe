import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';

export default function CartScreen() {
    const { items, itemCount, subtotal, removeItem, updateQuantity, clearCart } = useCart();

    const handleClearCart = () => {
        Alert.alert('Clear Cart', 'Remove all items from cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
        ]);
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.card}>
            {item.menuItem.imageUrl ? (
                <Image source={{ uri: item.menuItem.imageUrl }} style={styles.itemImage} />
            ) : (
                <View style={styles.itemImagePlaceholder}>
                    <Text style={styles.itemImageIcon}>☕</Text>
                </View>
            )}
            <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={1}>{item.menuItem.name}</Text>
                <Text style={styles.itemPrice}>
                    Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}
                </Text>
                {item.notes ? (
                    <Text style={styles.itemNotes} numberOfLines={1}>Note: {item.notes}</Text>
                ) : null}
            </View>
            <View style={styles.itemActions}>
                <View style={styles.qtyControl}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        accessibilityRole="button"
                        accessibilityLabel="Decrease quantity"
                    >
                        <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        accessibilityRole="button"
                        accessibilityLabel="Increase quantity"
                    >
                        <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeItem(item.menuItem.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.menuItem.name}`}
                >
                    <Text style={styles.removeBtnText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛍️</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>Add some items from the menu</Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => router.push('/(tabs)/menu')}
                >
                    <Text style={styles.browseBtnText}>Browse Menu</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header actions */}
            <View style={styles.headerActions}>
                <Text style={styles.itemCountText}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
                <TouchableOpacity onPress={handleClearCart}>
                    <Text style={styles.clearText}>Clear all</Text>
                </TouchableOpacity>
            </View>

            {/* Items */}
            <FlatList
                data={items}
                keyExtractor={(i) => i.menuItem.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            {/* Order Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>Rp {subtotal.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service charge</Text>
                    <Text style={styles.summaryValue}>Rp 0</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>Rp {subtotal.toLocaleString('id-ID')}</Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => router.push('/checkout')}
                    accessibilityRole="button"
                >
                    <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAF5',
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E7DD',
    },
    itemCountText: {
        color: '#8F7772',
        fontSize: 14,
        fontWeight: '600',
    },
    clearText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: '#F0E7DD',
        borderRadius: 14,
        flexDirection: 'row',
        overflow: 'hidden',
        alignItems: 'center',
    },
    itemImage: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
    },
    itemImagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#D8C3A5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemImageIcon: {
        fontSize: 28,
    },
    itemBody: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 4,
    },
    itemName: {
        color: '#1F1C1A',
        fontSize: 14,
        fontWeight: '700',
    },
    itemPrice: {
        color: '#C6453E',
        fontSize: 13,
        fontWeight: '600',
    },
    itemNotes: {
        color: '#8F7772',
        fontSize: 11,
    },
    itemActions: {
        paddingRight: 12,
        gap: 8,
        alignItems: 'flex-end',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFAF5',
        borderRadius: 8,
        overflow: 'hidden',
    },
    qtyBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#D8C3A5',
    },
    qtyBtnText: {
        color: '#1F1C1A',
        fontSize: 15,
        fontWeight: '700',
    },
    qtyText: {
        color: '#C6453E',
        fontSize: 13,
        fontWeight: '700',
        paddingHorizontal: 10,
        minWidth: 28,
        textAlign: 'center',
    },
    removeBtn: {
        padding: 4,
    },
    removeBtnText: {
        fontSize: 18,
    },
    summary: {
        backgroundColor: '#F0E7DD',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#8F7772',
        fontSize: 14,
    },
    summaryValue: {
        color: '#1F1C1A',
        fontSize: 14,
    },
    summaryTotal: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#D8C3A5',
        marginTop: 4,
    },
    totalLabel: {
        color: '#1F1C1A',
        fontSize: 16,
        fontWeight: '700',
    },
    totalValue: {
        color: '#C6453E',
        fontSize: 18,
        fontWeight: '800',
    },
    checkoutBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    checkoutBtnText: {
        color: '#FFFAF5',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#FFFAF5',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 32,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 8,
    },
    emptyTitle: {
        color: '#1F1C1A',
        fontSize: 20,
        fontWeight: '700',
    },
    emptySubtitle: {
        color: '#8F7772',
        fontSize: 14,
        textAlign: 'center',
    },
    browseBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 12,
        marginTop: 8,
    },
    browseBtnText: {
        color: '#FFFAF5',
        fontSize: 15,
        fontWeight: '700',
    },
});
