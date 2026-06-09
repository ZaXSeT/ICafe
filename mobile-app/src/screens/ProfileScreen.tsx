import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/orderService';
import { Order } from '../types';

function statusColor(status: string) {
    switch (status) {
        case 'completed': return '#22C55E';
        case 'confirmed': return '#60A5FA';
        case 'preparing': return '#A78BFA';
        case 'ready': return '#34D399';
        case 'pending': return '#F59E0B';
        case 'cancelled': return '#EF4444';
        default: return '#94A3B8';
    }
}

function statusLabel(status: string) {
    switch (status) {
        case 'completed': return 'Completed';
        case 'confirmed': return 'Confirmed';
        case 'preparing': return 'Preparing';
        case 'ready': return 'Ready';
        case 'pending': return 'Pending';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
}

export default function ProfileScreen() {
    const { user, userProfile, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!user) return;
        getUserOrders(user.uid)
            .then(setOrders)
            .catch((e) => console.error('Error fetching orders:', e))
            .finally(() => setLoadingOrders(false));
    }, [user]);

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/login');
                },
            },
        ]);
    };

    if (!user) {
        return (
            <View style={styles.notLoggedIn}>
                <Text style={styles.notLoggedInIcon}>👤</Text>
                <Text style={styles.notLoggedInTitle}>Not signed in</Text>
                <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.signInBtnText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(userProfile?.displayName ?? user.displayName ?? user.email ?? 'U')
                            .charAt(0)
                            .toUpperCase()}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                        {userProfile?.displayName ?? user.displayName ?? 'User'}
                    </Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {userProfile?.role ?? 'customer'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{orders.length}</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {orders.filter((o) => o.status === 'completed').length}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        Rp {orders
                            .filter((o) => o.status === 'completed')
                            .reduce((sum, o) => sum + o.total, 0)
                            .toLocaleString('id-ID', { notation: 'compact', maximumFractionDigits: 0 })}
                    </Text>
                    <Text style={styles.statLabel}>Spent</Text>
                </View>
            </View>

            {/* Order History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order History</Text>
                {loadingOrders ? (
                    <ActivityIndicator color="#F59E0B" style={{ marginVertical: 20 }} />
                ) : orders.length === 0 ? (
                    <View style={styles.emptyOrders}>
                        <Text style={styles.emptyOrdersText}>No orders yet</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
                            <Text style={styles.emptyOrdersLink}>Browse menu</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    orders.slice(0, 10).map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                                <View
                                    style={[
                                        styles.orderStatus,
                                        { backgroundColor: statusColor(order.status) + '22' },
                                    ]}
                                >
                                    <Text style={[styles.orderStatusText, { color: statusColor(order.status) }]}>
                                        {statusLabel(order.status)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.orderItems}>
                                {order.items
                                    .map((i) => `${i.quantity}x ${i.name}`)
                                    .join(', ')}
                            </Text>
                            <View style={styles.orderFooter}>
                                <Text style={styles.orderDate}>
                                    {order.createdAt.toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <Text style={styles.orderTotal}>
                                    Rp {order.total.toLocaleString('id-ID')}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Menu Options */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuOptions}>
                    <TouchableOpacity
                        style={styles.menuOption}
                        onPress={() => router.push('/(tabs)/reservations')}
                    >
                        <Text style={styles.menuOptionIcon}>📊</Text>
                        <Text style={styles.menuOptionLabel}>My Reservations</Text>
                        <Text style={styles.menuOptionArrow}>›</Text>
                    </TouchableOpacity>
                    <View style={styles.menuOptionDivider} />
                    <TouchableOpacity style={styles.menuOption} onPress={handleLogout}>
                        <Text style={styles.menuOptionIcon}>🚪</Text>
                        <Text style={[styles.menuOptionLabel, styles.menuOptionLabelDanger]}>Sign Out</Text>
                        <Text style={styles.menuOptionArrow}>›</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    content: { padding: 20, paddingBottom: 40 },
    notLoggedIn: {
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 32,
    },
    notLoggedInIcon: { fontSize: 64 },
    notLoggedInTitle: { color: '#F1F5F9', fontSize: 20, fontWeight: '700' },
    signInBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 12,
    },
    signInBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 16 },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        backgroundColor: '#F59E0B',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
    profileInfo: { flex: 1, gap: 4 },
    profileName: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
    profileEmail: { color: '#64748B', fontSize: 13 },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#1E3A5F',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 2,
    },
    roleText: { color: '#60A5FA', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        gap: 4,
    },
    statValue: { color: '#F59E0B', fontSize: 18, fontWeight: '800' },
    statLabel: { color: '#64748B', fontSize: 11, textAlign: 'center' },
    section: { marginBottom: 24 },
    sectionTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '700', marginBottom: 12 },
    emptyOrders: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        gap: 8,
    },
    emptyOrdersText: { color: '#64748B', fontSize: 14 },
    emptyOrdersLink: { color: '#F59E0B', fontSize: 14, fontWeight: '600' },
    orderCard: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        gap: 6,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: { color: '#F1F5F9', fontSize: 14, fontWeight: '700' },
    orderStatus: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    orderStatusText: { fontSize: 12, fontWeight: '600' },
    orderItems: { color: '#94A3B8', fontSize: 12, lineHeight: 16 },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    orderDate: { color: '#64748B', fontSize: 12 },
    orderTotal: { color: '#F59E0B', fontSize: 14, fontWeight: '700' },
    menuOptions: { backgroundColor: '#1E293B', borderRadius: 14, overflow: 'hidden' },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    menuOptionIcon: { fontSize: 20 },
    menuOptionLabel: { flex: 1, color: '#F1F5F9', fontSize: 15 },
    menuOptionLabelDanger: { color: '#EF4444' },
    menuOptionArrow: { color: '#334155', fontSize: 20 },
    menuOptionDivider: { height: 1, backgroundColor: '#334155', marginHorizontal: 16 },
});
