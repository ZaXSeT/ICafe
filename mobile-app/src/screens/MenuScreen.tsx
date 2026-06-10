import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
    const { addItem, getItemQuantity, updateQuantity } = useCart();
    const { user, userProfile, toggleFavorite } = useAuth();
    
    const [items, setItems] = useState<MenuItem[]>([]);
    const [filtered, setFiltered] = useState<MenuItem[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const favoriteIds = useMemo(() => userProfile?.favoriteItems || [], [userProfile?.favoriteItems]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMenuItems();
            setItems(data);
        } catch (e) {
            console.error('Error fetching menu:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Derive categories dynamically from the items fetched
    const categories = useMemo(() => {
        const cats = new Set(items.map(i => i.category));
        return ['all', 'favorites', ...Array.from(cats)].filter(Boolean);
    }, [items]);

    useEffect(() => {
        if (category === 'all') {
            setFiltered(items);
        } else if (category === 'favorites') {
            setFiltered(items.filter(i => favoriteIds.includes(i.id)));
        } else {
            setFiltered(items.filter(i => i.category === category));
        }
    }, [items, category, favoriteIds]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchItems();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <Text style={styles.headerSubtitle}>Browse & order your favorites</Text>
            
            <FlatList
                horizontal
                data={categories}
                keyExtractor={(c) => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
                renderItem={({ item: cat }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            category === cat && styles.categoryChipActive,
                        ]}
                        onPress={() => setCategory(cat)}
                    >
                        {cat === 'favorites' && (
                            <Feather 
                                name="heart" 
                                size={14} 
                                color={category === cat ? '#C6453E' : '#8F7772'} 
                                style={{ marginRight: 4 }} 
                            />
                        )}
                        <Text
                            style={[
                                styles.categoryLabel,
                                category === cat && styles.categoryLabelActive,
                            ]}
                        >
                            {cat === 'all' ? 'All' : cat === 'favorites' ? 'Favorites' : cat}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {category !== 'all' && category !== 'favorites' && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{category}</Text>
                </View>
            )}
            {category === 'favorites' && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Favorites</Text>
                </View>
            )}
        </View>
    );

    const renderItem = ({ item }: { item: MenuItem }) => {
        const qty = getItemQuantity(item.id);
        const isFavorite = favoriteIds.includes(item.id);

        return (
            <View style={styles.card}>
                <View style={styles.cardImageContainer}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                    ) : (
                        <View style={styles.cardImagePlaceholder}>
                            <Feather name="coffee" size={24} color="#D8C3A5" />
                        </View>
                    )}
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.cardInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                            {item.featured && (
                                <View style={styles.featuredBadge}>
                                    <Text style={styles.featuredBadgeText}>NEW</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
                        <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.cardActions}>
                        <TouchableOpacity 
                            onPress={() => {
                                if (!user) {
                                    Alert.alert('Sign In Required', 'Please sign in to save favorites.', [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Sign In', onPress: () => router.push('/login') }
                                    ]);
                                    return;
                                }
                                if (toggleFavorite) toggleFavorite(item.id);
                            }}
                            style={styles.favoriteBtn}
                        >
                            <Feather 
                                name="heart" 
                                size={18} 
                                color={isFavorite ? '#C6453E' : '#D1D5DB'} 
                                style={isFavorite ? styles.heartFilled : undefined}
                            />
                        </TouchableOpacity>

                        {qty === 0 ? (
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => addItem(item)}
                            >
                                <Feather name="plus" size={20} color="#1F1C1A" />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.qtyControl}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item.id, qty - 1)}
                                >
                                    <Feather name="minus" size={16} color="#1F1C1A" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{qty}</Text>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => addItem(item)}
                                >
                                    <Feather name="plus" size={16} color="#1F1C1A" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {loading && items.length === 0 ? (
                <ActivityIndicator color="#C6453E" style={styles.loader} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeader()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="search" size={48} color="#E7E5E4" />
                            <Text style={styles.emptyText}>No items found.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C6453E" />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAF9',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontFamily: 'Gyahegi',
        fontSize: 32,
        color: '#1F1C1A',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#8F7772',
        marginBottom: 20,
    },
    categoryList: {
        paddingBottom: 16,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#F5F5F4',
    },
    categoryChipActive: {
        backgroundColor: '#FFF1F0',
        borderColor: '#C6453E',
    },
    categoryLabel: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#8F7772',
        fontSize: 13,
        textTransform: 'capitalize',
    },
    categoryLabelActive: {
        fontFamily: 'Montserrat_700Bold',
        color: '#C6453E',
    },
    sectionHeader: {
        marginTop: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: 'Gyahegi',
        fontSize: 28,
        color: '#1F1C1A',
        textTransform: 'capitalize',
    },
    loader: {
        marginTop: 60,
    },
    list: {
        paddingBottom: 24,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    emptyText: {
        fontFamily: 'Montserrat_500Medium',
        color: '#A8A29E',
        fontSize: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 16,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 8,
    },
    cardName: {
        fontFamily: 'Montserrat_700Bold',
        color: '#111827',
        fontSize: 16,
    },
    featuredBadge: {
        backgroundColor: '#FEF08A',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    featuredBadgeText: {
        fontFamily: 'Montserrat_800ExtraBold',
        color: '#854D0E',
        fontSize: 9,
    },
    cardDesc: {
        fontFamily: 'Montserrat_400Regular',
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 2,
        marginBottom: 4,
    },
    cardPrice: {
        fontFamily: 'Montserrat_800ExtraBold',
        color: '#C6453E',
        fontSize: 15,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    favoriteBtn: {
        padding: 4,
    },
    heartFilled: {
        shadowColor: '#C6453E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 18,
        height: 36,
    },
    qtyBtn: {
        width: 32,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontFamily: 'Montserrat_700Bold',
        color: '#1F1C1A',
        fontSize: 14,
        minWidth: 16,
        textAlign: 'center',
    },
});

