import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/order_service.dart';
import '../models/order.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (auth.userProfile == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF1A1A1A),
        body: Center(
          child: Text('Login untuk melihat pesanan',
              style: TextStyle(color: Colors.white54)),
        ),
      );
    }

    final service = OrderService();
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Text('Pesanan Saya',
            style: TextStyle(color: Colors.white)),
      ),
      body: StreamBuilder<List<Order>>(
        stream: service.userOrdersStream(auth.userProfile!.uid),
        builder: (ctx, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(
                    color: Color(0xFFC8A96E)));
          }
          final orders = snap.data ?? [];
          if (orders.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long_outlined,
                      size: 64, color: Colors.white38),
                  SizedBox(height: 16),
                  Text('Belum ada pesanan',
                      style: TextStyle(color: Colors.white54)),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: orders.length,
            itemBuilder: (_, i) => _OrderCard(order: orders[i]),
          );
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  Color _statusColor() {
    switch (order.status) {
      case OrderStatus.confirmed:
        return Colors.blue;
      case OrderStatus.preparing:
        return Colors.orange;
      case OrderStatus.ready:
        return Colors.green;
      case OrderStatus.completed:
        return Colors.teal;
      case OrderStatus.cancelled:
        return Colors.redAccent;
      default:
        return Colors.orange;
    }
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _statusColor().withOpacity(0.3)),
      ),
      child: ExpansionTile(
        tilePadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '#${order.id.substring(0, 8).toUpperCase()}',
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _statusColor().withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                order.statusLabel,
                style: TextStyle(color: _statusColor(), fontSize: 11),
              ),
            ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                DateFormat('d MMM yyyy, HH:mm')
                    .format(order.createdAt),
                style: const TextStyle(
                    color: Colors.white60, fontSize: 12),
              ),
              Text(
                'Rp ${_formatPrice(order.total)}',
                style: const TextStyle(
                  color: Color(0xFFC8A96E),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        iconColor: Colors.white54,
        collapsedIconColor: Colors.white54,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(color: Color(0xFF3A3A3A)),
                ...order.items.map((item) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment:
                            MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${item.name} x${item.quantity}',
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 13),
                          ),
                          Text(
                            'Rp ${_formatPrice(item.subtotal)}',
                            style: const TextStyle(
                                color: Colors.white60, fontSize: 13),
                          ),
                        ],
                      ),
                    )),
                if (order.tableNumber != null) ...
                  [
                    const SizedBox(height: 8),
                    Text(
                      'Meja: ${order.tableNumber}',
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 12),
                    ),
                  ],
                if (order.notes != null) ...
                  [
                    Text(
                      'Catatan: ${order.notes}',
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 12),
                    ),
                  ],
                Text(
                  'Pembayaran: ${order.paymentMethod == 'cash' ? 'Tunai' : 'Transfer'}',
                  style: const TextStyle(
                      color: Colors.white60, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Screen untuk menampilkan order sukses
class OrderSuccessScreen extends StatelessWidget {
  final String orderId;
  const OrderSuccessScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle,
                  color: Colors.green, size: 80),
              const SizedBox(height: 24),
              const Text(
                'Pesanan Berhasil!',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'ID: #${orderId.substring(0, 8).toUpperCase()}',
                style:
                    const TextStyle(color: Colors.white60, fontSize: 14),
              ),
              const SizedBox(height: 16),
              const Text(
                'Pesanan kamu sedang diproses.\nKami akan segera menyiapkan pesananmu.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, height: 1.6),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context)
                      .popUntil((r) => r.isFirst),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC8A96E),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Kembali ke Beranda',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => Navigator.of(context)
                    .popUntil((r) => r.isFirst),
                child: const Text('Lihat Pesanan',
                    style: TextStyle(color: Color(0xFFC8A96E))),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
