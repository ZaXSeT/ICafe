import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/order.dart';
import '../models/cart_item.dart';

class OrderService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Buat order baru dari cart
  Future<String> createOrder({
    required String userId,
    required String userEmail,
    required List<CartItem> items,
    required double total,
    String? tableNumber,
    String? notes,
    String paymentMethod = 'cash',
  }) async {
    final orderData = {
      'userId': userId,
      'userEmail': userEmail,
      'items': items.map((i) => i.toOrderItem()).toList(),
      'total': total,
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
      if (tableNumber != null && tableNumber.isNotEmpty)
        'tableNumber': tableNumber,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
      'paymentMethod': paymentMethod,
    };

    final ref = await _db.collection('orders').add(orderData);
    return ref.id;
  }

  // Stream orders untuk user
  Stream<List<Order>> userOrdersStream(String userId) {
    return _db
        .collection('orders')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(Order.fromFirestore).toList());
  }

  // Get single order
  Future<Order?> getOrder(String orderId) async {
    final doc = await _db.collection('orders').doc(orderId).get();
    if (!doc.exists) return null;
    return Order.fromFirestore(doc);
  }

  // Stream single order (untuk realtime status update)
  Stream<Order?> orderStream(String orderId) {
    return _db
        .collection('orders')
        .doc(orderId)
        .snapshots()
        .map((doc) => doc.exists ? Order.fromFirestore(doc) : null);
  }
}
