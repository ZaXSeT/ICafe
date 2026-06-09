import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/reservation.dart';

class ReservationService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Buat reservasi baru
  Future<String> createReservation({
    required String userId,
    required String userName,
    required String userEmail,
    required String userPhone,
    required DateTime date,
    required String time,
    required int guestCount,
    String? specialRequest,
  }) async {
    final data = {
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'userPhone': userPhone,
      'date': Timestamp.fromDate(date),
      'time': time,
      'guestCount': guestCount,
      if (specialRequest != null && specialRequest.isNotEmpty)
        'specialRequest': specialRequest,
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
    };

    final ref = await _db.collection('reservations').add(data);
    return ref.id;
  }

  // Stream reservasi user
  Stream<List<Reservation>> userReservationsStream(String userId) {
    return _db
        .collection('reservations')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(Reservation.fromFirestore).toList());
  }

  // Cancel reservasi
  Future<void> cancelReservation(String reservationId) async {
    await _db
        .collection('reservations')
        .doc(reservationId)
        .update({'status': 'cancelled'});
  }

  // Get available time slots untuk tanggal tertentu
  List<String> getAvailableTimeSlots() {
    return [
      '09:00', '09:30',
      '10:00', '10:30',
      '11:00', '11:30',
      '12:00', '12:30',
      '13:00', '13:30',
      '14:00', '14:30',
      '15:00', '15:30',
      '16:00', '16:30',
      '17:00', '17:30',
      '18:00', '18:30',
      '19:00', '19:30',
      '20:00', '20:30',
    ];
  }
}
