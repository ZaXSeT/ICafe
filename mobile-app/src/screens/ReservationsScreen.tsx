import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import {
    createReservation,
    getUserReservations,
    cancelReservation,
    CreateReservationData,
} from '../services/reservationService';
import { Reservation } from '../types';

const TABLES = [
    { id: '1', number: '#1', seats: 2, location: 'Window' },
    { id: '2', number: '#2', seats: 2, location: 'Window' },
    { id: '3', number: '#3', seats: 4, location: 'Main Floor' },
    { id: '4', number: '#4', seats: 4, location: 'Main Floor' },
    { id: '5', number: '#5', seats: 6, location: 'Patio' },
    { id: '6', number: '#6', seats: 2, location: 'Bar' },
];

const TIME_SLOTS = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

export default function ReservationsScreen() {
    const { user, userProfile } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Which table is selected for booking
    const [selectedTable, setSelectedTable] = useState<typeof TABLES[0] | null>(null);

    // Form state
    const [guestCount, setGuestCount] = useState('2');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showMyRes, setShowMyRes] = useState(false);
    
    const { width } = useWindowDimensions();
    const CARD_WIDTH = (width - 48) / 2; // 2 columns

    const fetchReservations = async () => {
        if (!user) return;
        try {
            const data = await getUserReservations(user.uid);
            setReservations(data);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [user]);

    const handleBookPress = (table: typeof TABLES[0]) => {
        setSelectedTable(table);
        setGuestCount(table.seats.toString());
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (!selectedTime) {
            Alert.alert('Error', 'Please select a time slot.');
            return;
        }
        const guests = parseInt(guestCount, 10);
        if (isNaN(guests) || guests < 1 || guests > 20) {
            Alert.alert('Error', 'Guest count must be between 1 and 20.');
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            Alert.alert('Error', 'Please select a future date.');
            return;
        }

        setSubmitting(true);
        try {
            const data: CreateReservationData = {
                userId: user.uid,
                userEmail: user.email ?? '',
                userName: userProfile?.displayName ?? user.displayName ?? 'Guest',
                guestCount: guests,
                date: selectedDate,
                time: selectedTime,
                notes: notes || undefined,
                tableNumber: selectedTable ? `Table ${selectedTable.id}` : undefined,
            };
            await createReservation(data);
            Alert.alert(
                'Table Reserved!',
                'Your table has been successfully booked.',
                [{ text: 'OK' }]
            );
            setShowForm(false);
            setNotes('');
            setSelectedTime('');
            setSelectedTable(null);
            fetchReservations();
            setShowMyRes(true); // show their reservations after booking
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to create reservation.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = (id: string) => {
        Alert.alert('Cancel Reservation', 'Are you sure you want to cancel?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, cancel',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await cancelReservation(id);
                        fetchReservations();
                    } catch (err) {
                        Alert.alert('Error', 'Failed to cancel reservation.');
                    }
                },
            },
        ]);
    };

    const addDays = (d: Date, n: number) => {
        const next = new Date(d);
        next.setDate(next.getDate() + n);
        return next;
    };
    const dateOptions = Array.from({ length: 30 }).map((_, i) => addDays(new Date(), i));

    if (showMyRes) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowMyRes(false)} style={styles.backBtn}>
                        <Feather name="arrow-left" size={20} color="#8F7772" />
                        <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Reservations</Text>
                </View>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {loading ? (
                        <ActivityIndicator color="#C6453E" />
                    ) : reservations.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: '#8F7772', marginTop: 40 }}>No reservations yet.</Text>
                    ) : (
                        reservations.map((res) => (
                            <View key={res.id} style={styles.myResCard}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.myResDate}>{res.date.toLocaleDateString()}</Text>
                                    <Text style={[styles.myResStatus, res.status === 'CANCELLED' && { color: '#EF4444' }]}>{res.status}</Text>
                                </View>
                                <Text style={styles.myResDetails}>{res.time} • {res.tableNumber || 'Any Table'} • {res.guestCount} guests</Text>
                                {(res.status === 'PENDING' || res.status === 'pending') && (
                                    <TouchableOpacity onPress={() => handleCancel(res.id)} style={{ marginTop: 12 }}>
                                        <Text style={{ color: '#EF4444', fontWeight: '600' }}>Cancel</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => setShowMyRes(true)}>
                        <Feather name="list" size={20} color="#8F7772" />
                        <Text style={styles.backBtnText}>My Bookings</Text>
                    </TouchableOpacity>
                    <View style={{ marginBottom: 4 }}>
                        <Text style={styles.headerTitle}>Reserve a</Text>
                        <Text style={[styles.headerTitle, { marginTop: -16 }]}>Table</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>Real-time availability</Text>
                </View>

                <View style={styles.liveUpdatesPill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveUpdatesText}>LIVE UPDATES</Text>
                </View>

                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.legendText}>Available</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.legendText}>Reserved</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#D1D5DB' }]} />
                        <Text style={styles.legendText}>N/A</Text>
                    </View>
                </View>

                <View style={styles.tableGrid}>
                    {TABLES.map(table => (
                        <View key={table.id} style={[styles.tableCard, { width: CARD_WIDTH }]}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={styles.tableNumber}>{table.number}</Text>
                                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                            </View>
                            
                            <View style={styles.tableInfoRow}>
                                <Feather name="users" size={14} color="#8F7772" />
                                <Text style={styles.tableInfoText}>{table.seats} seats</Text>
                            </View>
                            
                            <View style={styles.tableInfoRow}>
                                <Feather name="map-pin" size={14} color="#8F7772" />
                                <Text style={styles.tableInfoText}>{table.location}</Text>
                            </View>

                            <TouchableOpacity 
                                style={styles.bookBtn}
                                onPress={() => handleBookPress(table)}
                            >
                                <Text style={styles.bookBtnText}>Book</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

            </ScrollView>

            <Modal
                visible={showForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowForm(false)}
            >
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Book {selectedTable?.number}</Text>
                        <TouchableOpacity onPress={() => setShowForm(false)}>
                            <Feather name="x" size={24} color="#8F7772" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.fieldLabel}>Select Date</Text>
                        <FlatList
                            horizontal
                            data={dateOptions}
                            keyExtractor={(d) => d.toISOString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.dateList}
                            renderItem={({ item: date }) => {
                                const isSelected = date.toDateString() === selectedDate.toDateString();
                                return (
                                    <TouchableOpacity
                                        style={[styles.dateChip, isSelected && styles.dateChipActive]}
                                        onPress={() => setSelectedDate(date)}
                                    >
                                        <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextActive]}>
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </Text>
                                        <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextActive]}>
                                            {date.getDate()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        <Text style={styles.fieldLabel}>Select Time</Text>
                        <TouchableOpacity
                            style={styles.timeSelector}
                            onPress={() => setShowTimeModal(true)}
                        >
                            <Text style={selectedTime ? styles.timeSelectorValue : styles.timeSelectorPlaceholder}>
                                {selectedTime || 'Choose a time slot'}
                            </Text>
                            <Feather name="chevron-down" size={20} color="#8F7772" />
                        </TouchableOpacity>

                        <Text style={styles.fieldLabel}>Number of Guests</Text>
                        <View style={styles.guestControl}>
                            <TouchableOpacity
                                style={styles.guestBtn}
                                onPress={() => setGuestCount(String(Math.max(1, parseInt(guestCount || '1', 10) - 1)))}
                            >
                                <Text style={styles.guestBtnText}>−</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.guestInput}
                                value={guestCount}
                                onChangeText={setGuestCount}
                                keyboardType="numeric"
                                textAlign="center"
                            />
                            <TouchableOpacity
                                style={styles.guestBtn}
                                onPress={() => setGuestCount(String(Math.min(20, parseInt(guestCount || '0', 10) + 1)))}
                            >
                                <Text style={styles.guestBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.fieldLabel}>Special Requests (optional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="Allergies, high chair, birthday surprise..."
                            placeholderTextColor="#8F7772"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Confirm Booking</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <Modal
                    visible={showTimeModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowTimeModal(false)}
                >
                    <TouchableOpacity
                        style={styles.timeModalOverlay}
                        onPress={() => setShowTimeModal(false)}
                    >
                        <View style={styles.timeModalContent}>
                            <Text style={styles.timeModalTitle}>Choose Time Slot</Text>
                            <FlatList
                                data={TIME_SLOTS}
                                keyExtractor={(t) => t}
                                numColumns={3}
                                renderItem={({ item: time }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.timeSlot,
                                            selectedTime === time && styles.timeSlotActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedTime(time);
                                            setShowTimeModal(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.timeSlotText,
                                                selectedTime === time && styles.timeSlotTextActive,
                                            ]}
                                        >
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAF9' },
    content: { padding: 16, paddingBottom: 40 },
    header: { marginBottom: 20 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    backBtnText: { color: '#8F7772', fontSize: 14, fontWeight: '600' },
    headerTitle: { fontFamily: 'Gyahegi', fontSize: 36, color: '#1F1C1A' },
    headerSubtitle: { fontSize: 14, color: '#8F7772' },
    
    liveUpdatesPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF2CC',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
    },
    liveUpdatesText: {
        color: '#D97706',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    
    legendRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        color: '#8F7772',
        fontSize: 12,
        fontWeight: '500',
    },

    tableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    tableCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    tableNumber: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1F1C1A',
    },
    tableInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    tableInfoText: {
        color: '#8F7772',
        fontSize: 13,
    },
    bookBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 20,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    bookBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    myResCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    myResDate: { fontWeight: '700', fontSize: 16, color: '#1F1C1A' },
    myResStatus: { fontWeight: '700', color: '#F59E0B' },
    myResDetails: { color: '#8F7772', marginTop: 4 },

    modal: { flex: 1, backgroundColor: '#EBEBEB' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 52 : 20,
        backgroundColor: '#FFFFFF',
    },
    modalTitle: { color: '#1F1C1A', fontSize: 18, fontWeight: '700' },
    modalContent: { padding: 20 },
    fieldLabel: {
        color: '#8F7772',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 16,
        textTransform: 'uppercase',
    },
    dateList: { gap: 8, paddingBottom: 4 },
    dateChip: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginRight: 8,
    },
    dateChipActive: { backgroundColor: '#C6453E' },
    dateChipDay: { color: '#8F7772', fontSize: 11, fontWeight: '600', marginBottom: 4 },
    dateChipNum: { color: '#1F1C1A', fontSize: 20, fontWeight: '800' },
    dateChipTextActive: { color: '#FFFFFF' },
    
    timeSelector: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeSelectorValue: { color: '#1F1C1A', fontSize: 15, fontWeight: '600' },
    timeSelectorPlaceholder: { color: '#8F7772', fontSize: 15 },
    
    guestControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    guestBtn: { paddingHorizontal: 24, paddingVertical: 14, backgroundColor: '#DFDFDF' },
    guestBtnText: { color: '#1F1C1A', fontSize: 20, fontWeight: '700' },
    guestInput: { flex: 1, color: '#C6453E', fontSize: 18, fontWeight: '700', textAlign: 'center' },
    
    textInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        color: '#1F1C1A',
        fontSize: 15,
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    
    submitBtn: {
        backgroundColor: '#C6453E',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    
    timeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    timeModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '70%',
    },
    timeModalTitle: {
        color: '#1F1C1A',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },
    timeSlot: {
        flex: 1,
        margin: 6,
        backgroundColor: '#F0E7DD',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    timeSlotActive: { backgroundColor: '#C6453E' },
    timeSlotText: { color: '#1F1C1A', fontSize: 14, fontWeight: '600' },
    timeSlotTextActive: { color: '#FFFFFF' },
});

