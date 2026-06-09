import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../models/cart_item.dart';
import 'package:cached_network_image/cached_network_image.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text('Keranjang', style: TextStyle(color: Colors.white)),
        actions: [
          Consumer<CartProvider>(
            builder: (ctx, cart, _) => cart.isEmpty
                ? const SizedBox()
                : TextButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => AlertDialog(
                          backgroundColor: const Color(0xFF2A2A2A),
                          title: const Text('Kosongkan Keranjang',
                              style: TextStyle(color: Colors.white)),
                          content: const Text('Hapus semua item?',
                              style: TextStyle(color: Colors.white70)),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: const Text('Batal',
                                  style: TextStyle(color: Colors.white60)),
                            ),
                            TextButton(
                              onPressed: () {
                                cart.clearCart();
                                Navigator.pop(context);
                              },
                              child: const Text('Hapus',
                                  style: TextStyle(color: Colors.redAccent)),
                            ),
                          ],
                        ),
                      );
                    },
                    child: const Text('Hapus Semua',
                        style: TextStyle(color: Colors.redAccent)),
                  ),
          ),
        ],
      ),
      body: Consumer<CartProvider>(
        builder: (ctx, cart, _) {
          if (cart.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_cart_outlined,
                      size: 64, color: Colors.white38),
                  const SizedBox(height: 16),
                  const Text('Keranjang kosong',
                      style:
                          TextStyle(color: Colors.white54, fontSize: 18)),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => context.pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFC8A96E),
                    ),
                    child: const Text('Lihat Menu',
                        style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: cart.itemList.length,
                  itemBuilder: (_, i) =>
                      _CartItemTile(item: cart.itemList[i]),
                ),
              ),
              // Order summary
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Color(0xFF222222),
                  border:
                      Border(top: BorderSide(color: Color(0xFF333333))),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${cart.itemCount} item',
                          style: const TextStyle(color: Colors.white70),
                        ),
                        Text(
                          'Rp ${_formatPrice(cart.total)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => context.push('/checkout'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFC8A96E),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(
                          'Checkout • Rp ${_formatPrice(cart.total)}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _CartItemTile extends StatelessWidget {
  final CartItem item;

  const _CartItemTile({required this.item});

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 60,
              height: 60,
              child: item.menuItem.imageUrl.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: item.menuItem.imageUrl,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: const Color(0xFF3A3A3A),
                        child: const Icon(Icons.restaurant,
                            color: Color(0xFFC8A96E), size: 24),
                      ),
                    )
                  : Container(
                      color: const Color(0xFF3A3A3A),
                      child: const Icon(Icons.restaurant,
                          color: Color(0xFFC8A96E), size: 24),
                    ),
            ),
          ),
          const SizedBox(width: 12),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.menuItem.name,
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Rp ${_formatPrice(item.menuItem.price)}',
                  style: const TextStyle(
                      color: Color(0xFFC8A96E), fontSize: 13),
                ),
                Text(
                  'Subtotal: Rp ${_formatPrice(item.subtotal)}',
                  style: const TextStyle(
                      color: Colors.white60, fontSize: 12),
                ),
              ],
            ),
          ),
          // Quantity controls
          Row(
            children: [
              IconButton(
                onPressed: () => cart.decreaseQuantity(item.menuItem.id),
                icon: const Icon(Icons.remove_circle_outline,
                    color: Colors.white54, size: 20),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  '${item.quantity}',
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
              IconButton(
                onPressed: () => cart.addItem(item.menuItem),
                icon: const Icon(Icons.add_circle_outline,
                    color: Color(0xFFC8A96E), size: 20),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
