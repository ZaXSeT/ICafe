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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
    createReservation,
    getUserReservations,
    cancelReservation,
    CreateReservationData,
} from '../services/reservationService';
import { Reservation } from '../types';

const TIME_SLOTS = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

function formatDate(date: Date) {
    return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function statusColor(status: string) {
    switch (status) {
        case 'confirmed': return '#22C55E';
        case 'pending': return '#F59E0B';
        case 'cancelled': return '#EF4444';
        case 'completed': return '#60A5FA';
        default: return '#94A3B8';
    }
}

function statusLabel(status: string) {
    switch (status) {
        case 'confirmed': return 'Confirmed ✓';
        case 'pending': return 'Pending ⏳';
        case 'cancelled': return 'Cancelled ✕';
        case 'completed': return 'Completed';
        default: return status;
    }
}

export default function ReservationsScreen() {
    const { user, userProfile } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [guestCount, setGuestCount] = useState('2');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [showTimeModal, setShowTimeModal] = useState(false);

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
        // Check date is not in the past
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
            };
            await createReservation(data);
            Alert.alert(
                'Reservation Submitted!',
                'We will confirm your reservation soon.',
                [{ text: 'OK' }]
            );
            setShowForm(false);
            setNotes('');
            setSelectedTime('');
            setGuestCount('2');
            fetchReservations();
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

    // Date navigation helpers
    const addDays = (d: Date, n: number) => {
        const next = new Date(d);
        next.setDate(next.getDate() + n);
        return next;
    };

    const generateDateOptions = () => {
        const dates = [];
        for (let i = 0; i <= 30; i++) {
            dates.push(addDays(new Date(), i));
        }
        return dates;
    };

    const dateOptions = generateDateOptions();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>My Reservations</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setShowForm(true)}
                        accessibilityRole="button"
                    >
                        <Text style={styles.addBtnText}>+ New</Text>
                    </TouchableOpacity>
                </View>

                {/* Reservations List */}
                {loading ? (
                    <ActivityIndicator color="#F59E0B" style={{ marginTop: 40 }} />
                ) : reservations.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyTitle}>No reservations yet</Text>
                        <Text style={styles.emptySubtitle}>Book a table to get started</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
                            <Text style={styles.emptyBtnText}>Book a Table</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    reservations.map((res) => (
                        <View key={res.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardDate}>{formatDate(res.date)}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor(res.status) + '22' }]}>
                                    <Text style={[styles.statusText, { color: statusColor(res.status) }]}>
                                        {statusLabel(res.status)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>⏰</Text>
                                <Text style={styles.cardValue}>{res.time}</Text>
                                <Text style={styles.cardLabel}>👥</Text>
                                <Text style={styles.cardValue}>{res.guestCount} guests</Text>
                            </View>
                            {res.notes ? (
                                <Text style={styles.cardNotes}>📝 {res.notes}</Text>
                            ) : null}
                            {(res.status === 'pending' || res.status === 'confirmed') && (
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => handleCancel(res.id)}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* New Reservation Modal */}
            <Modal
                visible={showForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowForm(false)}
            >
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>New Reservation</Text>
                        <TouchableOpacity onPress={() => setShowForm(false)}>
                            <Text style={styles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Date Selection */}
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
                                            {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                                        </Text>
                                        <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextActive]}>
                                            {date.getDate()}
                                        </Text>
                                        <Text style={[styles.dateChipMonth, isSelected && styles.dateChipTextActive]}>
                                            {date.toLocaleDateString('id-ID', { month: 'short' })}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {/* Time Selection */}
                        <Text style={styles.fieldLabel}>Select Time</Text>
                        <TouchableOpacity
                            style={styles.timeSelector}
                            onPress={() => setShowTimeModal(true)}
                        >
                            <Text style={selectedTime ? styles.timeSelectorValue : styles.timeSelectorPlaceholder}>
                                {selectedTime || 'Choose a time slot'}
                            </Text>
                            <Text style={styles.timeSelectorArrow}>▾</Text>
                        </TouchableOpacity>

                        {/* Guest Count */}
                        <Text style={styles.fieldLabel}>Number of Guests</Text>
                        <View style={styles.guestControl}>
                            <TouchableOpacity
                                style={styles.guestBtn}
                                onPress={() =>
                                    setGuestCount(String(Math.max(1, parseInt(guestCount || '1', 10) - 1)))
                                }
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
                                onPress={() =>
                                    setGuestCount(String(Math.min(20, parseInt(guestCount || '0', 10) + 1)))
                                }
                            >
                                <Text style={styles.guestBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Notes */}
                        <Text style={styles.fieldLabel}>Special Requests (optional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="Allergies, high chair, birthday surprise..."
                            placeholderTextColor="#64748B"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                        />

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#0F172A" />
                            ) : (
                                <Text style={styles.submitBtnText}>Book Table</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Time Picker Modal */}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    content: { padding: 20, paddingBottom: 40 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: { color: '#F1F5F9', fontSize: 20, fontWeight: '700' },
    addBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
    empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyIcon: { fontSize: 56 },
    emptyTitle: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
    emptySubtitle: { color: '#64748B', fontSize: 14 },
    emptyBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        paddingHorizontal: 28,
        paddingVertical: 12,
        marginTop: 8,
    },
    emptyBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 15 },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        gap: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: { color: '#F1F5F9', fontSize: 14, fontWeight: '700', flex: 1 },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 12, fontWeight: '700' },
    cardRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    cardLabel: { fontSize: 14 },
    cardValue: { color: '#94A3B8', fontSize: 13, marginRight: 12 },
    cardNotes: { color: '#64748B', fontSize: 12, fontStyle: 'italic' },
    cancelBtn: {
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        marginTop: 4,
    },
    cancelBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
    // Modal
    modal: { flex: 1, backgroundColor: '#0F172A' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        paddingTop: Platform.OS === 'ios' ? 52 : 20,
    },
    modalTitle: { color: '#F1F5F9', fontSize: 18, fontWeight: '700' },
    modalClose: { color: '#94A3B8', fontSize: 20, padding: 4 },
    modalContent: { padding: 20 },
    fieldLabel: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateList: { gap: 8, paddingBottom: 4 },
    dateChip: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        minWidth: 64,
        marginRight: 8,
    },
    dateChipActive: { backgroundColor: '#F59E0B' },
    dateChipDay: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
    dateChipNum: { color: '#F1F5F9', fontSize: 20, fontWeight: '800' },
    dateChipMonth: { color: '#94A3B8', fontSize: 11 },
    dateChipTextActive: { color: '#0F172A' },
    timeSelector: {
        backgroundColor: '#1E293B',
        borderRadius: 10,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    timeSelectorValue: { color: '#F1F5F9', fontSize: 15 },
    timeSelectorPlaceholder: { color: '#64748B', fontSize: 15 },
    timeSelectorArrow: { color: '#94A3B8', fontSize: 16 },
    guestControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    guestBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#334155',
    },
    guestBtnText: { color: '#F1F5F9', fontSize: 20, fontWeight: '700' },
    guestInput: {
        flex: 1,
        color: '#F59E0B',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: 12,
    },
    textInput: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#F1F5F9',
        fontSize: 15,
    },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    submitBtn: {
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
    // Time picker modal
    timeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    timeModalContent: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    timeModalTitle: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
    },
    timeSlot: {
        flex: 1,
        margin: 4,
        backgroundColor: '#0F172A',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    timeSlotActive: { backgroundColor: '#F59E0B' },
    timeSlotText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
    timeSlotTextActive: { color: '#0F172A' },
});
