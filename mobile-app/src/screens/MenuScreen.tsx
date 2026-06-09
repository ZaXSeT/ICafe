import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { getMenuItems } from '../services/menuService';
import { MenuItem, MenuCategory } from '../types';

const CATEGORIES: { key: MenuCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '🍽️' },
    { key: 'coffee', label: 'Coffee', icon: '☕' },
    { key: 'tea', label: 'Tea', icon: '🍵' },
    { key: 'food', label: 'Food', icon: '🥗' },
    { key: 'dessert', label: 'Dessert', icon: '🍰' },
    { key: 'other', label: 'Other', icon: '🧃' },
];

export default function MenuScreen() {
    const { addItem, getItemQuantity, updateQuantity } = useCart();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [filtered, setFiltered] = useState<MenuItem[]>([]);
    const [category, setCategory] = useState<MenuCategory>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchItems = useCallback(async (cat: MenuCategory) => {
        setLoading(true);
        try {
            const data = await getMenuItems(cat);
            setItems(data);
        } catch (e) {
            console.error('Error fetching menu:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchItems(category);
    }, [category]);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(items);
        } else {
            const q = search.toLowerCase();
            setFiltered(
                items.filter(
                    (i) =>
                        i.name.toLowerCase().includes(q) ||
                        i.description.toLowerCase().includes(q)
                )
            );
        }
    }, [items, search]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchItems(category);
    };

    const renderItem = ({ item }: { item: MenuItem }) => {
        const qty = getItemQuantity(item.id);
        return (
            <View style={styles.card}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                ) : (
                    <View style={styles.cardImagePlaceholder}>
                        <Text style={styles.cardImageIcon}>☕</Text>
                    </View>
                )}
                <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                        {item.featured && (
                            <View style={styles.featuredBadge}>
                                <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                        {qty === 0 ? (
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => addItem(item)}
                                accessibilityRole="button"
                                accessibilityLabel={`Add ${item.name} to cart`}
                            >
                                <Text style={styles.addBtnText}>+ Add</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.qtyControl}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item.id, qty - 1)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Decrease quantity"
                                >
                                    <Text style={styles.qtyBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{qty}</Text>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => addItem(item)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Increase quantity"
                                >
                                    <Text style={styles.qtyBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search menu..."
                    placeholderTextColor="#64748B"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Text style={styles.clearSearch}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Categories */}
            <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(c) => c.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
                renderItem={({ item: cat }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            category === cat.key && styles.categoryChipActive,
                        ]}
                        onPress={() => setCategory(cat.key)}
                        accessibilityRole="button"
                        accessibilityLabel={cat.label}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text
                            style={[
                                styles.categoryLabel,
                                category === cat.key && styles.categoryLabelActive,
                            ]}
                        >
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Items List */}
            {loading ? (
                <ActivityIndicator color="#F59E0B" style={styles.loader} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>🍽️</Text>
                            <Text style={styles.emptyText}>
                                {search ? `No results for "${search}"` : 'No items available.'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 8,
    },
    searchIcon: {
        fontSize: 16,
    },
    searchInput: {
        flex: 1,
        color: '#F1F5F9',
        fontSize: 15,
    },
    clearSearch: {
        color: '#64748B',
        fontSize: 16,
        padding: 4,
    },
    categoryList: {
        paddingHorizontal: 16,
        paddingBottom: 4,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 6,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: '#F59E0B',
    },
    categoryIcon: {
        fontSize: 14,
    },
    categoryLabel: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
    },
    categoryLabelActive: {
        color: '#0F172A',
    },
    loader: {
        marginTop: 60,
    },
    list: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 14,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    cardImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
    },
    cardImagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardImageIcon: {
        fontSize: 32,
    },
    cardBody: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    cardName: {
        color: '#F1F5F9',
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    featuredBadge: {
        backgroundColor: '#1E3A5F',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    featuredBadgeText: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: '600',
    },
    cardDesc: {
        color: '#64748B',
        fontSize: 12,
        lineHeight: 16,
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    cardPrice: {
        color: '#F59E0B',
        fontSize: 14,
        fontWeight: '700',
    },
    addBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    addBtnText: {
        color: '#0F172A',
        fontSize: 13,
        fontWeight: '700',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        borderRadius: 8,
        overflow: 'hidden',
    },
    qtyBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#334155',
    },
    qtyBtnText: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '700',
    },
    qtyText: {
        color: '#F59E0B',
        fontSize: 14,
        fontWeight: '700',
        paddingHorizontal: 10,
        minWidth: 32,
        textAlign: 'center',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyIcon: {
        fontSize: 48,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 15,
        textAlign: 'center',
    },
});
