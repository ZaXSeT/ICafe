import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/menu_item.dart';
import '../services/order_service.dart';

class CartProvider extends ChangeNotifier {
  final OrderService _orderService = OrderService();
  final Map<String, CartItem> _items = {};

  Map<String, CartItem> get items => Map.unmodifiable(_items);
  List<CartItem> get itemList => _items.values.toList();
  int get itemCount => _items.values.fold(0, (sum, i) => sum + i.quantity);
  bool get isEmpty => _items.isEmpty;

  double get total =>
      _items.values.fold(0.0, (sum, i) => sum + i.subtotal);

  void addItem(MenuItem menuItem) {
    if (_items.containsKey(menuItem.id)) {
      _items[menuItem.id]!.quantity++;
    } else {
      _items[menuItem.id] = CartItem(
        id: menuItem.id,
        menuItem: menuItem,
        quantity: 1,
      );
    }
    notifyListeners();
  }

  void removeItem(String menuItemId) {
    _items.remove(menuItemId);
    notifyListeners();
  }

  void decreaseQuantity(String menuItemId) {
    if (!_items.containsKey(menuItemId)) return;
    if (_items[menuItemId]!.quantity <= 1) {
      _items.remove(menuItemId);
    } else {
      _items[menuItemId]!.quantity--;
    }
    notifyListeners();
  }

  void increaseQuantity(String menuItemId) {
    if (!_items.containsKey(menuItemId)) return;
    _items[menuItemId]!.quantity++;
    notifyListeners();
  }

  void updateNote(String menuItemId, String note) {
    if (!_items.containsKey(menuItemId)) return;
    _items[menuItemId] = _items[menuItemId]!.copyWith(note: note);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  int getQuantity(String menuItemId) {
    return _items[menuItemId]?.quantity ?? 0;
  }

  // Checkout: buat order di Firestore
  Future<String> checkout({
    required String userId,
    required String userEmail,
    String? tableNumber,
    String? notes,
    String paymentMethod = 'cash',
  }) async {
    if (_items.isEmpty) throw Exception('Cart kosong');

    final orderId = await _orderService.createOrder(
      userId: userId,
      userEmail: userEmail,
      items: itemList,
      total: total,
      tableNumber: tableNumber,
      notes: notes,
      paymentMethod: paymentMethod,
    );

    clearCart();
    return orderId;
  }
}
