import 'package:cloud_firestore/cloud_firestore.dart';

enum OrderStatus { pending, confirmed, preparing, ready, completed, cancelled }

class OrderItem {
  final String menuItemId;
  final String name;
  final double price;
  final int quantity;
  final double subtotal;
  final String? note;

  const OrderItem({
    required this.menuItemId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.subtotal,
    this.note,
  });

  factory OrderItem.fromMap(Map<String, dynamic> map) => OrderItem(
        menuItemId: map['menuItemId'] ?? '',
        name: map['name'] ?? '',
        price: (map['price'] ?? 0).toDouble(),
        quantity: map['quantity'] ?? 1,
        subtotal: (map['subtotal'] ?? 0).toDouble(),
        note: map['note'],
      );
}

class Order {
  final String id;
  final String userId;
  final String userEmail;
  final List<OrderItem> items;
  final double total;
  final OrderStatus status;
  final DateTime createdAt;
  final String? tableNumber;
  final String? notes;
  final String paymentMethod;

  const Order({
    required this.id,
    required this.userId,
    required this.userEmail,
    required this.items,
    required this.total,
    required this.status,
    required this.createdAt,
    this.tableNumber,
    this.notes,
    this.paymentMethod = 'cash',
  });

  factory Order.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Order(
      id: doc.id,
      userId: data['userId'] ?? '',
      userEmail: data['userEmail'] ?? '',
      items: (data['items'] as List<dynamic>? ?? [])
          .map((i) => OrderItem.fromMap(i as Map<String, dynamic>))
          .toList(),
      total: (data['total'] ?? 0).toDouble(),
      status: _statusFromString(data['status'] ?? 'pending'),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      tableNumber: data['tableNumber'],
      notes: data['notes'],
      paymentMethod: data['paymentMethod'] ?? 'cash',
    );
  }

  static OrderStatus _statusFromString(String s) {
    return OrderStatus.values.firstWhere(
      (e) => e.name == s,
      orElse: () => OrderStatus.pending,
    );
  }

  String get statusLabel {
    switch (status) {
      case OrderStatus.pending:
        return 'Menunggu Konfirmasi';
      case OrderStatus.confirmed:
        return 'Dikonfirmasi';
      case OrderStatus.preparing:
        return 'Sedang Diproses';
      case OrderStatus.ready:
        return 'Siap Diambil';
      case OrderStatus.completed:
        return 'Selesai';
      case OrderStatus.cancelled:
        return 'Dibatalkan';
    }
  }
}
