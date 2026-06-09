import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useCart } from '../../context/CartContext';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
    return (
        <View style={styles.tabIcon}>
            <Text style={[styles.tabIconEmoji, focused && styles.tabIconEmojiActive]}>{icon}</Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
        </View>
    );
}

function CartTabIcon({ focused }: { focused: boolean }) {
    const { itemCount } = useCart();
    return (
        <View style={styles.tabIcon}>
            <View>
                <Text style={[styles.tabIconEmoji, focused && styles.tabIconEmojiActive]}>🛍️</Text>
                {itemCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>
                            {itemCount > 9 ? '9+' : itemCount}
                        </Text>
                    </View>
                )}
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Cart</Text>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: '#1E293B' },
                headerTintColor: '#F1F5F9',
                headerTitleStyle: { fontWeight: '700' },
                tabBarStyle: {
                    backgroundColor: '#1E293B',
                    borderTopColor: '#334155',
                    height: 64,
                    paddingBottom: 8,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🏠" label="Home" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🍽️" label="Menu" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="reservations"
                options={{
                    title: 'Reservations',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📊" label="Reserve" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="👤" label="Profile" focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingTop: 4,
    },
    tabIconEmoji: {
        fontSize: 22,
        opacity: 0.5,
    },
    tabIconEmojiActive: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
    },
    tabLabelActive: {
        color: '#F59E0B',
        fontWeight: '700',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
    },
});
