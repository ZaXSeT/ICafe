import 'menu_item.dart';

class CartItem {
  final String id;
  final MenuItem menuItem;
  int quantity;
  final String? note;

  CartItem({
    required this.id,
    required this.menuItem,
    this.quantity = 1,
    this.note,
  });

  double get subtotal => menuItem.price * quantity;

  CartItem copyWith({int? quantity, String? note}) => CartItem(
        id: id,
        menuItem: menuItem,
        quantity: quantity ?? this.quantity,
        note: note ?? this.note,
      );

  Map<String, dynamic> toOrderItem() => {
        'menuItemId': menuItem.id,
        'name': menuItem.name,
        'price': menuItem.price,
        'quantity': quantity,
        'subtotal': subtotal,
        if (note != null && note!.isNotEmpty) 'note': note,
      };
}
