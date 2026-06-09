import 'package:cloud_firestore/cloud_firestore.dart';

enum ReservationStatus { pending, confirmed, cancelled, completed }

class Reservation {
  final String id;
  final String userId;
  final String userName;
  final String userEmail;
  final String userPhone;
  final DateTime date;
  final String time;
  final int guestCount;
  final String? specialRequest;
  final ReservationStatus status;
  final DateTime createdAt;

  const Reservation({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.userPhone,
    required this.date,
    required this.time,
    required this.guestCount,
    this.specialRequest,
    this.status = ReservationStatus.pending,
    required this.createdAt,
  });

  factory Reservation.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Reservation(
      id: doc.id,
      userId: data['userId'] ?? '',
      userName: data['userName'] ?? data['name'] ?? '',
      userEmail: data['userEmail'] ?? data['email'] ?? '',
      userPhone: data['userPhone'] ?? data['phone'] ?? '',
      date: (data['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
      time: data['time'] ?? '',
      guestCount: data['guestCount'] ?? data['guests'] ?? 1,
      specialRequest: data['specialRequest'] ?? data['notes'],
      status: _statusFromString(data['status'] ?? 'pending'),
      createdAt:
          (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  static ReservationStatus _statusFromString(String s) {
    return ReservationStatus.values.firstWhere(
      (e) => e.name == s,
      orElse: () => ReservationStatus.pending,
    );
  }

  Map<String, dynamic> toMap() => {
        'userId': userId,
        'userName': userName,
        'userEmail': userEmail,
        'userPhone': userPhone,
        'date': Timestamp.fromDate(date),
        'time': time,
        'guestCount': guestCount,
        if (specialRequest != null) 'specialRequest': specialRequest,
        'status': status.name,
        'createdAt': Timestamp.fromDate(createdAt),
      };

  String get statusLabel {
    switch (status) {
      case ReservationStatus.pending:
        return 'Menunggu Konfirmasi';
      case ReservationStatus.confirmed:
        return 'Dikonfirmasi';
      case ReservationStatus.cancelled:
        return 'Dibatalkan';
      case ReservationStatus.completed:
        return 'Selesai';
    }
  }
}
