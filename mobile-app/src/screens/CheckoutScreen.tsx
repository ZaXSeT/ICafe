import React, { useState, useEffect } from 'react';
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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feather } from '@expo/vector-icons';

const PAYMENT_METHODS = [
  { id: "CASH", label: "Pay at Cashier", icon: "dollar-sign" },
  { id: "EWALLET", label: "E-Wallet (QRIS)", icon: "smartphone" },
  { id: "CARD", label: "Credit / Debit Card", icon: "credit-card" },
];

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  location: string;
}

export default function CheckoutScreen() {
    const { user, userProfile } = useAuth();
    const { items, subtotal, clearCart } = useCart();
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [orderType, setOrderType] = useState<"TAKEAWAY" | "DINE_IN">("TAKEAWAY");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    useEffect(() => {
      const fetchTables = async () => {
        try {
          const q = query(collection(db, 'tables'), where('status', '==', 'AVAILABLE'));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
          // Sort by number
          data.sort((a, b) => a.number - b.number);
          setTables(data);
        } catch (err) {
          console.error("Error fetching tables:", err);
        }
      };
      fetchTables();
    }, []);

    const handlePlaceOrder = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Add items to cart before ordering.');
            return;
        }
        if (orderType === "DINE_IN" && !selectedTableId) {
            Alert.alert('Table Required', 'Please select a table for Dine In.');
            return;
        }

        setLoading(true);
        try {
            const selectedTable = tables.find(t => t.id === selectedTableId);
            const tableNum = orderType === "DINE_IN" && selectedTable ? selectedTable.number : undefined;
            // In a real app we'd also pass orderType and paymentMethod to createOrder.
            // For now createOrder accepts notes and tableNum.
            // Note: If you want to store paymentMethod and orderType, you might need to update orderService!
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

    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Order Type */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Type</Text>
                <View style={styles.orderTypeRow}>
                    <TouchableOpacity 
                        style={[styles.typeBtn, orderType === "TAKEAWAY" && styles.typeBtnActive]}
                        onPress={() => { setOrderType("TAKEAWAY"); setSelectedTableId(null); }}
                    >
                        <Feather name="package" size={20} color={orderType === "TAKEAWAY" ? "#C6453E" : "#8F7772"} />
                        <Text style={[styles.typeBtnText, orderType === "TAKEAWAY" && styles.typeBtnTextActive]}>Takeaway</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.typeBtn, orderType === "DINE_IN" && styles.typeBtnActive]}
                        onPress={() => setOrderType("DINE_IN")}
                    >
                        <Feather name="coffee" size={20} color={orderType === "DINE_IN" ? "#C6453E" : "#8F7772"} />
                        <Text style={[styles.typeBtnText, orderType === "DINE_IN" && styles.typeBtnTextActive]}>Dine In</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Table Selection */}
            {orderType === "DINE_IN" && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Table</Text>
                    {tables.length === 0 ? (
                        <Text style={styles.emptyText}>No available tables.</Text>
                    ) : (
                        <View style={styles.tableGrid}>
                            {tables.map(t => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[styles.tableBtn, selectedTableId === t.id && styles.tableBtnActive]}
                                    onPress={() => setSelectedTableId(t.id)}
                                >
                                    <Text style={[styles.tableBtnNum, selectedTableId === t.id && styles.tableBtnTextActive]}>T{t.number}</Text>
                                    <Text style={[styles.tableBtnCap, selectedTableId === t.id && styles.tableBtnTextActive]}>{t.capacity} pax</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Payment Method */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment</Text>
                <View style={styles.paymentList}>
                    {PAYMENT_METHODS.map(pm => (
                        <TouchableOpacity
                            key={pm.id}
                            style={[styles.paymentBtn, paymentMethod === pm.id && styles.paymentBtnActive]}
                            onPress={() => setPaymentMethod(pm.id)}
                        >
                            <View style={[styles.radioCircle, paymentMethod === pm.id && styles.radioCircleActive]}>
                                {paymentMethod === pm.id && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.paymentIconWrap}>
                                <Feather name={pm.icon as any} size={18} color="#1F1C1A" />
                            </View>
                            <Text style={styles.paymentBtnText}>{pm.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {items.map((item) => (
                    <View key={item.menuItem.id} style={styles.summaryItem}>
                        <Text style={styles.summaryItemName}>
                            {item.quantity}x {item.menuItem.name}
                        </Text>
                        <Text style={styles.summaryItemPrice}>
                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Notes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Special Instructions</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any special requests?"
                    placeholderTextColor="#8F7772"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                />
            </View>

            {/* Order Total */}
            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax (10%)</Text>
                    <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total</Text>
                    <Text style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</Text>
                </View>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
                style={[styles.orderBtn, loading && styles.orderBtnDisabled]}
                onPress={handlePlaceOrder}
                disabled={loading || items.length === 0}
                accessibilityRole="button"
            >
                {loading ? (
                    <ActivityIndicator color="#FFFAF5" />
                ) : (
                    <Text style={styles.orderBtnText}>Place Order — ${grandTotal.toFixed(2)}</Text>
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
        backgroundColor: '#FAFAF9',
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
        color: '#1F1C1A',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    orderTypeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    typeBtnActive: {
        borderColor: '#C6453E',
        backgroundColor: '#FFF1F1',
    },
    typeBtnText: {
        fontWeight: '600',
        color: '#8F7772',
    },
    typeBtnTextActive: {
        color: '#C6453E',
    },
    tableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tableBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    tableBtnActive: {
        borderColor: '#C6453E',
        backgroundColor: '#C6453E',
    },
    tableBtnNum: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F1C1A',
    },
    tableBtnCap: {
        fontSize: 12,
        color: '#8F7772',
    },
    tableBtnTextActive: {
        color: '#FFFFFF',
    },
    emptyText: {
        color: '#8F7772',
        fontSize: 14,
    },
    paymentList: {
        gap: 10,
    },
    paymentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
    },
    paymentBtnActive: {
        borderColor: '#C6453E',
        backgroundColor: '#FFF1F1',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioCircleActive: {
        borderColor: '#C6453E',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#C6453E',
    },
    paymentIconWrap: {
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 8,
        marginRight: 12,
    },
    paymentBtnText: {
        fontWeight: '600',
        color: '#1F1C1A',
        fontSize: 14,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryItemName: {
        color: '#8F7772',
        fontSize: 14,
        flex: 1,
    },
    summaryItemPrice: {
        color: '#1F1C1A',
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#1F1C1A',
        fontSize: 15,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    totalSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: {
        color: '#8F7772',
        fontSize: 14,
    },
    totalValue: {
        color: '#1F1C1A',
        fontSize: 14,
        fontWeight: '600',
    },
    grandTotalRow: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginTop: 4,
    },
    grandTotalLabel: {
        color: '#1F1C1A',
        fontSize: 16,
        fontWeight: '700',
    },
    grandTotalValue: {
        color: '#C6453E',
        fontSize: 18,
        fontWeight: '800',
    },
    orderBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    orderBtnDisabled: {
        opacity: 0.6,
    },
    orderBtnText: {
        color: '#FFFAF5',
        fontSize: 16,
        fontWeight: '700',
    },
    backBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    backBtnText: {
        color: '#8F7772',
        fontSize: 14,
    },
});
