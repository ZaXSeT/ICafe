import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  
  // State to hold menu items so we can display favorites if they exist
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  
  React.useEffect(() => {
    getMenuItems().then(setMenuItems).catch(console.error);
  }, []);

  const favoriteIds = useMemo(() => userProfile?.favoriteItems || [], [userProfile?.favoriteItems]);
  const favoriteItems = useMemo(() => menuItems.filter(i => favoriteIds.includes(i.id)), [menuItems, favoriteIds]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  const displayName = userProfile?.displayName ?? user?.displayName ?? 'Guest';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      {/* TOP HEADER BLOCK */}
      <View style={[styles.headerBlock, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>{greeting()}</Text>
            <Text style={styles.nameText}>{displayName}!</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Feather name="bell" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Overlapping Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="What are you craving today?"
            placeholderTextColor="#9CA3AF"
            onFocus={() => router.push('/(tabs)/menu')}
          />
        </View>
      </View>

      <View style={styles.bodyPadding}>
        {/* REWARDS CARD */}
        <View style={styles.rewardsCard}>
          <Feather name="coffee" size={140} color="#2A2A2A" style={styles.rewardsWatermark} />
          <View style={styles.rewardsTopRow}>
            <Text style={styles.rewardsTitle}>ICAFE REWARDS</Text>
            <TouchableOpacity style={styles.redeemBtn}>
              <Text style={styles.redeemBtnText}>Redeem</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsNumber}>240</Text>
            <Text style={styles.pointsLabel}>Pts</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '80%' }]} />
            </View>
            <Text style={styles.progressText}>60 pts more to Gold Tier</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
          onPress={() => router.push('/(tabs)/menu')}
        >
          <View style={styles.actionBtnLeft}>
            <View style={[styles.actionBtnIconCircle, { backgroundColor: '#D97706' }]}>
              <Feather name="coffee" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.actionBtnTitle}>Order Coffee</Text>
              <Text style={styles.actionBtnSubtitle}>Browse menu & add to cart</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: '#373636' }]}
          onPress={() => router.push('/(tabs)/reservations')}
        >
          <View style={styles.actionBtnLeft}>
            <View style={[styles.actionBtnIconCircle, { backgroundColor: '#4B4B4B' }]}>
              <Feather name="clock" size={20} color="#FBBF24" />
            </View>
            <View>
              <Text style={styles.actionBtnTitle}>Book a Table</Text>
              <Text style={styles.actionBtnSubtitle}>See live availability & reserve</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* YOUR FAVORITES */}
        <View style={styles.favoritesSection}>
          <Text style={styles.favoritesTitle}>Your Favorites</Text>
          
          {favoriteItems.length === 0 ? (
            <View style={styles.emptyFavorites}>
              <Feather name="heart" size={32} color="#D1D5DB" />
              <Text style={styles.emptyFavoritesTitle}>No favorites yet</Text>
              <Text style={styles.emptyFavoritesSub}>Tap the ❤️ on menu items to save them here</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }}>
              {favoriteItems.map((item, idx) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.favoriteCard, { marginLeft: idx === 0 ? 24 : 0 }]}
                  onPress={() => router.push('/(tabs)/menu')}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.favoriteImage} />
                  <Text style={styles.favoriteName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.favoritePrice}>${item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9', // Same as web bg-stone-50
  },
  content: {
    paddingBottom: 40,
  },
  headerBlock: {
    backgroundColor: '#C6453E',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginBottom: 20, // To give space for overlapping search bar
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontFamily: 'Montserrat_500Medium',
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: -4,
  },
  nameText: {
    fontFamily: 'Gyahegi',
    color: '#FFFFFF',
    fontSize: 48,
    marginTop: -8, // Tweak this because Gyahegi has tall line heights
  },
  bellBtn: {
    backgroundColor: '#D6655E',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'absolute',
    bottom: -24,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: '#111827',
  },
  bodyPadding: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  rewardsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  rewardsWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    opacity: 0.8,
  },
  rewardsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardsTitle: {
    fontFamily: 'Montserrat_700Bold',
    color: '#D4D4D8',
    fontSize: 12,
    letterSpacing: 1,
  },
  redeemBtn: {
    backgroundColor: '#C6453E',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  redeemBtnText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    fontSize: 13,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  pointsNumber: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#FFFFFF',
    fontSize: 36,
    marginRight: 8,
  },
  pointsLabel: {
    fontFamily: 'Montserrat_500Medium',
    color: '#D4D4D8',
    fontSize: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Montserrat_400Regular',
    color: '#A1A1AA',
    fontSize: 11,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  actionBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionBtnTitle: {
    fontFamily: 'Montserrat_700Bold',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 2,
  },
  actionBtnSubtitle: {
    fontFamily: 'Montserrat_400Regular',
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
  },
  favoritesSection: {
    marginTop: 20,
  },
  favoritesTitle: {
    fontFamily: 'Gyahegi',
    fontSize: 28,
    color: '#1F1C1A',
    marginBottom: 16,
  },
  emptyFavorites: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFavoritesTitle: {
    fontFamily: 'Montserrat_700Bold',
    color: '#4B5563',
    fontSize: 15,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyFavoritesSub: {
    fontFamily: 'Montserrat_400Regular',
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },
  favoriteCard: {
    width: 120,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  favoriteImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  favoriteName: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: '#111827',
    marginBottom: 4,
  },
  favoritePrice: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    color: '#C6453E',
  },
});
