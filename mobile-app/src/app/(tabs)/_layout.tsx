import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { Feather } from '@expo/vector-icons';

function TabIcon({ icon, label, focused }: { icon: any; label: string; focused: boolean }) {
    return (
        <View style={styles.tabIcon}>
            <Feather name={icon} size={22} color={focused ? '#C6453E' : '#8F7772'} />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
        </View>
    );
}

function CartTabIcon({ focused }: { focused: boolean }) {
    const { itemCount } = useCart();
    return (
        <View style={styles.tabIcon}>
            <View>
                <Feather name="shopping-bag" size={22} color={focused ? '#C6453E' : '#8F7772'} />
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
    const insets = useSafeAreaInsets();
    
    return (
        <Tabs
            screenOptions={{
                headerShown: false, // Hide default headers to match PWA custom headers
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#F0E7DD',
                    borderTopWidth: 1,
                    height: 64 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 8,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="home" label="Home" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="coffee" label="Menu" focused={focused} />
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
                        <TabIcon icon="calendar" label="Book" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="user" label="Profile" focused={focused} />
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
    },
    tabLabel: {
        fontSize: 10,
        color: '#8F7772',
        fontWeight: '500',
    },
    tabLabelActive: {
        color: '#C6453E',
        fontWeight: '700',
    },
    cartBadge: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: '#C6453E',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
    },
});
