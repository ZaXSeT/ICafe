import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getFeaturedMenuItems } from '../services/menuService';
import { MenuItem } from '../types';

export default function HomeScreen() {
  const { user, userProfile, logout } = useAuth();
  const { addItem, itemCount } = useCart();
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeatured = async () => {
    try {
      const items = await getFeaturedMenuItems();
      setFeatured(items);
    } catch (err) {
      console.error('Error fetching featured items:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeatured();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C6453E" />
      }
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.greeting}>
            {greeting()}, {userProfile?.displayName ?? user?.displayName ?? 'Guest'} ☀️
          </Text>
          <Text style={styles.heroTitle}>What would you like{`\n`}today?</Text>
          <Text style={styles.heroSubtitle}>
            Fresh coffee & food, ready for you.
          </Text>
        </View>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>☕</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/(tabs)/menu')}
          accessibilityRole="button"
        >
          <Text style={styles.quickActionIcon}>🍕</Text>
          <Text style={styles.quickActionLabel}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/(tabs)/cart')}
          accessibilityRole="button"
        >
          <Text style={styles.quickActionIcon}>🛍️</Text>
          <Text style={styles.quickActionLabel}>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/(tabs)/reservations')}
          accessibilityRole="button"
        >
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionLabel}>Reserve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityRole="button"
        >
          <Text style={styles.quickActionIcon}>👤</Text>
          <Text style={styles.quickActionLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Menu */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⭐ Featured</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#C6453E" style={{ marginVertical: 24 }} />
        ) : featured.length === 0 ? (
          <Text style={styles.emptyText}>No featured items right now.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredList}>
            {featured.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.featuredCard}
                onPress={() => router.push(`/menu/${item.id}`)}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
                ) : (
                  <View style={styles.featuredImagePlaceholder}>
                    <Text style={styles.featuredImagePlaceholderText}>☕</Text>
                  </View>
                )}
                <View style={styles.featuredCardBody}>
                  <Text style={styles.featuredName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.featuredDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.featuredFooter}>
                    <Text style={styles.featuredPrice}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addItem(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${item.name} to cart`}
                    >
                      <Text style={styles.addBtnText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Cafe Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>📍</Text>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>ICafe</Text>
          <Text style={styles.infoText}>Open daily 07:00 – 22:00 • Dine in & takeaway</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF5',
  },
  content: {
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#F0E7DD',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  greeting: {
    color: '#8F7772',
    fontSize: 14,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#1F1C1A',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#8F7772',
    fontSize: 14,
  },
  heroBadge: {
    width: 64,
    height: 64,
    backgroundColor: '#C6453E',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  heroBadgeText: {
    fontSize: 32,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#F0E7DD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  quickActionIcon: {
    fontSize: 22,
  },
  quickActionLabel: {
    color: '#8F7772',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1F1C1A',
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: '#C6453E',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredList: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  featuredCard: {
    backgroundColor: '#F0E7DD',
    borderRadius: 16,
    width: 200,
    marginRight: 14,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#D8C3A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImagePlaceholderText: {
    fontSize: 40,
  },
  featuredCardBody: {
    padding: 12,
  },
  featuredName: {
    color: '#1F1C1A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredDesc: {
    color: '#8F7772',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    color: '#C6453E',
    fontSize: 13,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: '#C6453E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addBtnText: {
    color: '#FFFAF5',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: '#8F7772',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  infoBanner: {
    marginHorizontal: 24,
    backgroundColor: '#F0E7DD',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#C6453E',
  },
  infoIcon: {
    fontSize: 24,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#1F1C1A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoText: {
    color: '#8F7772',
    fontSize: 13,
  },
});
