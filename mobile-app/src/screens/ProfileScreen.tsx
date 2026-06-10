import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/orderService';
import { Order } from '../types';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

function statusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'completed': return '#22C55E';
        case 'confirmed': return '#60A5FA';
        case 'preparing': return '#A78BFA';
        case 'ready': return '#34D399';
        case 'pending': return '#C6453E';
        case 'cancelled': return '#EF4444';
        default: return '#8F7772';
    }
}

function statusLabel(status: string) {
    const s = status.toLowerCase();
    switch (s) {
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
    const { user, userProfile, logout, updateUserProfile } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Edit Profile State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhotoUri, setEditPhotoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const openEditModal = () => {
        setEditName(userProfile?.displayName ?? user?.displayName ?? '');
        setEditPhotoUri(userProfile?.photoURL ?? user?.photoURL ?? null);
        setIsEditModalVisible(true);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload a profile picture.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setEditPhotoUri(result.assets[0].uri);
        }
    };

    const uploadImageAsync = async (uri: string) => {
        if (!user) return null;
        try {
            const blob: Blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    resolve(xhr.response);
                };
                xhr.onerror = function(e) {
                    console.error(e);
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });

            const filename = `avatars/${user.uid}-${Date.now()}`;
            const storageRef = ref(storage, filename);
            
            await uploadBytes(storageRef, blob);

            // We're done with the blob, close and release it
            if ((blob as any).close) {
                (blob as any).close();
            }

            return await getDownloadURL(storageRef);
        } catch (e) {
            console.error('Error uploading image', e);
            throw e;
        }
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }
        setIsSaving(true);
        try {
            let photoUrlToSave = userProfile?.photoURL ?? user?.photoURL;
            
            // If the photo URI changed and it's a local file (file://), upload it
            if (editPhotoUri && editPhotoUri !== photoUrlToSave && editPhotoUri.startsWith('file://')) {
                const uploadedUrl = await uploadImageAsync(editPhotoUri);
                if (uploadedUrl) {
                    photoUrlToSave = uploadedUrl;
                }
            }

            await updateUserProfile(editName.trim(), photoUrlToSave || undefined);
            setIsEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.notLoggedIn} edges={['top']}>
                <View style={styles.notLoggedInIconContainer}>
                    <Feather name="user-x" size={48} color="#8F7772" />
                </View>
                <Text style={styles.notLoggedInTitle}>Not signed in</Text>
                <Text style={styles.notLoggedInSubtitle}>Sign in to view your profile and orders.</Text>
                <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.signInBtnText}>Sign In</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const currentAvatarUrl = userProfile?.photoURL ?? user?.photoURL;
    const currentName = userProfile?.displayName ?? user?.displayName ?? 'User';
    const firstLetter = currentName.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileHeaderInner}>
                        <View style={styles.avatar}>
                            {currentAvatarUrl ? (
                                <Image source={{ uri: currentAvatarUrl }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{firstLetter}</Text>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{currentName}</Text>
                            <Text style={styles.profileEmail}>{user.email}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>
                                    {userProfile?.role ?? 'customer'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
                        <Feather name="edit-2" size={16} color="#8F7772" />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {orders.filter((o) => o.status === 'completed' || o.status === 'COMPLETED').length}
                        </Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            ${orders
                                .filter((o) => o.status === 'completed' || o.status === 'COMPLETED')
                                .reduce((acc, o) => acc + o.total, 0).toFixed(0)}
                        </Text>
                        <Text style={styles.statLabel}>Spent</Text>
                    </View>
                </View>

                {/* Order History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order History</Text>
                    {loadingOrders ? (
                        <ActivityIndicator color="#C6453E" style={{ marginVertical: 20 }} />
                    ) : orders.length === 0 ? (
                        <View style={styles.emptyOrders}>
                            <Feather name="shopping-bag" size={24} color="#D8C3A5" />
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
                                        ${order.total.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Account Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.menuOptions}>
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => router.push('/(tabs)/reservations')}
                        >
                            <View style={styles.menuOptionIconWrapper}>
                                <Feather name="calendar" size={18} color="#C6453E" />
                            </View>
                            <Text style={styles.menuOptionLabel}>My Reservations</Text>
                            <Feather name="chevron-right" size={20} color="#D8C3A5" />
                        </TouchableOpacity>
                        <View style={styles.menuOptionDivider} />
                        <TouchableOpacity style={styles.menuOption} onPress={handleLogout}>
                            <View style={[styles.menuOptionIconWrapper, { backgroundColor: '#FEE2E2' }]}>
                                <Feather name="log-out" size={18} color="#EF4444" />
                            </View>
                            <Text style={[styles.menuOptionLabel, styles.menuOptionLabelDanger]}>Sign Out</Text>
                            <Feather name="chevron-right" size={20} color="#D8C3A5" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    style={styles.modalOverlay} 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <Feather name="x" size={24} color="#8F7772" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalBody}>
                            <View style={styles.editAvatarContainer}>
                                <TouchableOpacity style={styles.editAvatarWrapper} onPress={pickImage}>
                                    {editPhotoUri ? (
                                        <Image source={{ uri: editPhotoUri }} style={styles.editAvatarImage} />
                                    ) : (
                                        <Text style={styles.avatarText}>{firstLetter}</Text>
                                    )}
                                    <View style={styles.editAvatarOverlay}>
                                        <Feather name="camera" size={20} color="#FFF" />
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.editAvatarHint}>Tap to change picture</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Display Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#8F7772"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={user.email || ''}
                                    editable={false}
                                />
                                <Text style={styles.inputHelp}>Email cannot be changed.</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                                onPress={handleSaveProfile}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAF9' },
    content: { padding: 16, paddingBottom: 40 },
    notLoggedIn: {
        flex: 1,
        backgroundColor: '#FAFAF9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    notLoggedInIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#F0E7DD',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    notLoggedInTitle: { color: '#1F1C1A', fontSize: 22, fontWeight: '700', marginBottom: 8 },
    notLoggedInSubtitle: { color: '#8F7772', fontSize: 14, textAlign: 'center', marginBottom: 24 },
    signInBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },
    signInBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    
    profileHeader: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileHeaderInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        backgroundColor: '#C6453E',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
    profileInfo: { flex: 1, gap: 4 },
    profileName: { color: '#1F1C1A', fontSize: 20, fontWeight: '700' },
    profileEmail: { color: '#8F7772', fontSize: 13 },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EFF6FF',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 2,
    },
    roleText: { color: '#3B82F6', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        marginTop: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F5F5F4',
        borderRadius: 8,
    },
    editBtnText: {
        color: '#8F7772',
        fontSize: 13,
        fontWeight: '600',
    },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statValue: { color: '#C6453E', fontSize: 20, fontWeight: '800' },
    statLabel: { color: '#8F7772', fontSize: 12, textAlign: 'center', fontWeight: '500' },
    
    section: { marginBottom: 24 },
    sectionTitle: { color: '#1F1C1A', fontSize: 18, fontWeight: '700', marginBottom: 12 },
    emptyOrders: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 8,
    },
    emptyOrdersText: { color: '#8F7772', fontSize: 15, marginTop: 4 },
    emptyOrdersLink: { color: '#C6453E', fontSize: 15, fontWeight: '700' },
    
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: { color: '#1F1C1A', fontSize: 14, fontWeight: '700' },
    orderStatus: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    orderStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    orderItems: { color: '#57534E', fontSize: 13, lineHeight: 18 },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F4',
        paddingTop: 12,
    },
    orderDate: { color: '#8F7772', fontSize: 12 },
    orderTotal: { color: '#1F1C1A', fontSize: 15, fontWeight: '800' },
    
    menuOptions: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    menuOptionIconWrapper: {
        width: 36,
        height: 36,
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuOptionLabel: { flex: 1, color: '#1F1C1A', fontSize: 15, fontWeight: '600' },
    menuOptionLabelDanger: { color: '#EF4444' },
    menuOptionDivider: { height: 1, backgroundColor: '#F5F5F4', marginHorizontal: 16 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FAFAF9',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F4',
    },
    modalTitle: { color: '#1F1C1A', fontSize: 18, fontWeight: '700' },
    modalBody: { padding: 20, paddingBottom: 40 },
    
    editAvatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    editAvatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#C6453E',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    editAvatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editAvatarOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatarHint: {
        color: '#8F7772',
        fontSize: 13,
        marginTop: 10,
    },

    inputGroup: { marginBottom: 20 },
    label: { color: '#57534E', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1F1C1A',
    },
    inputDisabled: {
        backgroundColor: '#F5F5F4',
        color: '#A8A29E',
    },
    inputHelp: { color: '#A8A29E', fontSize: 12, marginTop: 6 },
    
    saveBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
