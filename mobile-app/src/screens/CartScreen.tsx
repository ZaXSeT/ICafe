import React, { useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Animated,
    PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { Feather } from '@expo/vector-icons';

export default function CartScreen() {
    const { items, itemCount, subtotal, removeItem, updateQuantity, clearCart } = useCart();

    const slideY = useRef(new Animated.Value(0)).current;
    const currentY = useRef(0);
    const MAX_SLIDE = 180;

    React.useEffect(() => {
        const id = slideY.addListener(({ value }) => {
            currentY.current = value;
        });
        return () => slideY.removeListener(id);
    }, [slideY]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 10;
            },
            onPanResponderGrant: () => {
                slideY.stopAnimation();
                slideY.setOffset(currentY.current);
                slideY.setValue(0);
            },
            onPanResponderMove: (_, gestureState) => {
                let newY = gestureState.dy;
                // strictly clamp presentation value between 0 and MAX_SLIDE
                if (currentY.current + newY < 0) {
                    newY = -currentY.current;
                }
                if (currentY.current + newY > MAX_SLIDE) {
                    newY = MAX_SLIDE - currentY.current;
                }
                slideY.setValue(newY);
            },
            onPanResponderRelease: (_, gestureState) => {
                slideY.flattenOffset();
                let toValue = 0;
                
                if (gestureState.vy > 0.5 || gestureState.dy > 50) {
                    toValue = MAX_SLIDE;
                } else if (gestureState.vy < -0.5 || gestureState.dy < -50) {
                    toValue = 0;
                } else {
                    toValue = currentY.current > (MAX_SLIDE / 2) ? MAX_SLIDE : 0;
                }

                // Use timing to prevent any spring overshoot
                Animated.timing(slideY, {
                    toValue,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    const handleClearCart = () => {
        Alert.alert('Clear Cart', 'Remove all items from cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
        ]);
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                {item.menuItem.imageUrl ? (
                    <Image source={{ uri: item.menuItem.imageUrl }} style={styles.itemImage} />
                ) : (
                    <View style={styles.itemImagePlaceholder}>
                        <Feather name="coffee" size={28} color="#D8C3A5" />
                    </View>
                )}
            </View>
            <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.menuItem.name}</Text>
                    <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeItem(item.menuItem.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.menuItem.name}`}
                    >
                        <Feather name="trash-2" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                
                {item.notes ? (
                    <Text style={styles.itemNotes} numberOfLines={1}>Note: {item.notes}</Text>
                ) : null}
                
                <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </Text>
                    
                    <View style={styles.qtyControl}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            accessibilityRole="button"
                        >
                            <Feather name="minus" size={14} color="#1F1C1A" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            accessibilityRole="button"
                        >
                            <Feather name="plus" size={14} color="#1F1C1A" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer} edges={['top']}>
                <View style={styles.emptyIconCircle}>
                    <Feather name="shopping-bag" size={48} color="#D8C3A5" />
                </View>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>Looks like you haven't added any items to your cart yet.</Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => router.push('/(tabs)/menu')}
                >
                    <Text style={styles.browseBtnText}>Browse Menu</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart</Text>
                <TouchableOpacity onPress={handleClearCart}>
                    <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                keyExtractor={(i) => i.menuItem.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            {/* Order Summary Bottom Sheet */}
            <Animated.View 
                style={[styles.summary, { transform: [{ translateY: slideY }] }]}
                {...panResponder.panHandlers}
            >
                <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                </View>

                <View style={styles.summaryContent}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service charge</Text>
                        <Text style={styles.summaryValue}>$0.00</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={() => router.push('/checkout')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAF9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontFamily: 'Gyahegi',
        fontSize: 32,
        color: '#1F1C1A',
    },
    clearText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#EF4444',
        fontSize: 14,
    },
    list: {
        padding: 16,
        gap: 12,
        paddingTop: 12,
        paddingBottom: 220, // Add padding so list can be scrolled past the absolute bottom sheet
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        flexDirection: 'row',
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F5F5F4',
    },
    imageContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    itemImagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 0,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemName: {
        flex: 1,
        color: '#1F1C1A',
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        marginRight: 8,
    },
    removeBtn: {
        padding: 4,
        marginTop: -4,
        marginRight: -4,
    },
    itemNotes: {
        color: '#8F7772',
        fontSize: 11,
        fontFamily: 'Montserrat_400Regular',
        marginTop: 2,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 6,
    },
    itemPrice: {
        color: '#C6453E',
        fontSize: 14,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    qtyBtn: {
        width: 24,
        height: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    qtyText: {
        color: '#1F1C1A',
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
        minWidth: 24,
        textAlign: 'center',
    },
    summary: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingTop: 12,
        paddingBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F5F5F4',
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    dragHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    summaryContent: {
        gap: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#8F7772',
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
    },
    summaryValue: {
        color: '#1F1C1A',
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
    },
    summaryTotal: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F4',
        marginTop: 4,
    },
    totalLabel: {
        color: '#1F1C1A',
        fontSize: 18,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    totalValue: {
        color: '#C6453E',
        fontSize: 20,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    checkoutBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#C6453E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    checkoutBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#FAFAF9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3EBE1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontFamily: 'Gyahegi',
        color: '#1F1C1A',
        fontSize: 28,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontFamily: 'Montserrat_400Regular',
        color: '#8F7772',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    browseBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 16,
        paddingHorizontal: 40,
        paddingVertical: 16,
        shadowColor: '#C6453E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    browseBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
});
