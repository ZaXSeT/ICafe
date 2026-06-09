import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';

export default function CheckoutScreen() {
    const { user, userProfile } = useAuth();
    const { items, subtotal, clearCart } = useCart();
    const [notes, setNotes] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Add items to cart before ordering.');
            return;
        }

        setLoading(true);
        try {
            const tableNum = tableNumber ? parseInt(tableNumber, 10) : undefined;
            const orderId = await createOrder(user.uid, items, notes || undefined, tableNum);
            clearCart();
            Alert.alert(
                'Order Placed! 🎉',
                `Your order #${orderId.slice(-6).toUpperCase()} has been received.`,
                [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
            );
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Order Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🗞️ Order Summary</Text>
                {items.map((item) => (
                    <View key={item.menuItem.id} style={styles.summaryItem}>
                        <Text style={styles.summaryItemName}>
                            {item.quantity}x {item.menuItem.name}
                        </Text>
                        <Text style={styles.summaryItemPrice}>
                            Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Table Number */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👌 Seating (optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Table number (leave blank for takeaway)"
                    placeholderTextColor="#64748B"
                    value={tableNumber}
                    onChangeText={setTableNumber}
                    keyboardType="numeric"
                />
            </View>

            {/* Notes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Special Instructions</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any special requests?"
                    placeholderTextColor="#64748B"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                />
            </View>

            {/* Customer Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Customer</Text>
                <View style={styles.customerCard}>
                    <Text style={styles.customerName}>
                        {userProfile?.displayName ?? user?.displayName ?? 'Guest'}
                    </Text>
                    <Text style={styles.customerEmail}>{user?.email}</Text>
                </View>
            </View>

            {/* Payment method */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💳 Payment</Text>
                <View style={styles.paymentOption}>
                    <Text style={styles.paymentIcon}>💵</Text>
                    <Text style={styles.paymentLabel}>Pay at counter (Cash)</Text>
                    <View style={styles.paymentCheckmark}>
                        <Text style={styles.paymentCheckmarkText}>✓</Text>
                    </View>
                </View>
            </View>

            {/* Order Total */}
            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>Rp {subtotal.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Service charge</Text>
                    <Text style={styles.totalValue}>Rp 0</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total</Text>
                    <Text style={styles.grandTotalValue}>Rp {subtotal.toLocaleString('id-ID')}</Text>
                </View>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
                style={[styles.orderBtn, loading && styles.orderBtnDisabled]}
                onPress={handlePlaceOrder}
                disabled={loading}
                accessibilityRole="button"
            >
                {loading ? (
                    <ActivityIndicator color="#0F172A" />
                ) : (
                    <Text style={styles.orderBtnText}>Place Order 🎉</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Text style={styles.backBtnText}>Back to Cart</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
        gap: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryItemName: {
        color: '#94A3B8',
        fontSize: 14,
        flex: 1,
    },
    summaryItemPrice: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#1E293B',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#F1F5F9',
        fontSize: 15,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    customerCard: {
        backgroundColor: '#1E293B',
        borderRadius: 10,
        padding: 14,
        gap: 4,
    },
    customerName: {
        color: '#F1F5F9',
        fontSize: 15,
        fontWeight: '600',
    },
    customerEmail: {
        color: '#64748B',
        fontSize: 13,
    },
    paymentOption: {
        backgroundColor: '#1E293B',
        borderRadius: 10,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    paymentIcon: {
        fontSize: 22,
    },
    paymentLabel: {
        color: '#F1F5F9',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },
    paymentCheckmark: {
        width: 24,
        height: 24,
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentCheckmarkText: {
        color: '#0F172A',
        fontWeight: '700',
        fontSize: 14,
    },
    totalSection: {
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 16,
        gap: 10,
        marginBottom: 20,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: {
        color: '#94A3B8',
        fontSize: 14,
    },
    totalValue: {
        color: '#F1F5F9',
        fontSize: 14,
    },
    grandTotalRow: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#334155',
        marginTop: 4,
    },
    grandTotalLabel: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '700',
    },
    grandTotalValue: {
        color: '#F59E0B',
        fontSize: 18,
        fontWeight: '800',
    },
    orderBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    orderBtnDisabled: {
        opacity: 0.6,
    },
    orderBtnText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '700',
    },
    backBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    backBtnText: {
        color: '#64748B',
        fontSize: 14,
    },
});
