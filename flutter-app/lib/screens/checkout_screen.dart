import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/app_button.dart';
import '../widgets/app_text_field.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _tableCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String _paymentMethod = 'cash';
  bool _isLoading = false;

  @override
  void dispose() {
    _tableCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title:
            const Text('Checkout', style: TextStyle(color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order summary
            const Text(
              'Ringkasan Pesanan',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF2A2A2A),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  ...cart.itemList.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${item.menuItem.name} x${item.quantity}',
                                style: const TextStyle(
                                    color: Colors.white70),
                              ),
                            ),
                            Text(
                              'Rp ${_formatPrice(item.subtotal)}',
                              style:
                                  const TextStyle(color: Colors.white),
                            ),
                          ],
                        ),
                      )),
                  const Divider(color: Color(0xFF3A3A3A)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16)),
                      Text(
                        'Rp ${_formatPrice(cart.total)}',
                        style: const TextStyle(
                          color: Color(0xFFC8A96E),
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Table number
            AppTextField(
              controller: _tableCtrl,
              label: 'Nomor Meja (opsional)',
              hintText: 'Contoh: 5',
              keyboardType: TextInputType.number,
              prefixIcon: Icons.table_restaurant_outlined,
            ),

            const SizedBox(height: 16),

            // Notes
            AppTextField(
              controller: _notesCtrl,
              label: 'Catatan (opsional)',
              hintText: 'Contoh: Tidak pakai gula',
              prefixIcon: Icons.note_outlined,
              maxLines: 3,
            ),

            const SizedBox(height: 24),

            // Payment method
            const Text(
              'Metode Pembayaran',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _PaymentMethodCard(
                  icon: Icons.money,
                  label: 'Tunai',
                  value: 'cash',
                  selected: _paymentMethod == 'cash',
                  onTap: () => setState(() => _paymentMethod = 'cash'),
                ),
                const SizedBox(width: 12),
                _PaymentMethodCard(
                  icon: Icons.credit_card,
                  label: 'Transfer',
                  value: 'transfer',
                  selected: _paymentMethod == 'transfer',
                  onTap: () =>
                      setState(() => _paymentMethod = 'transfer'),
                ),
              ],
            ),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: AppButton(
                label:
                    'Buat Pesanan • Rp ${_formatPrice(cart.total)}',
                isLoading: _isLoading,
                onPressed: () async {
                  if (auth.userProfile == null) {
                    context.push('/login');
                    return;
                  }
                  setState(() => _isLoading = true);
                  try {
                    final orderId = await cart.checkout(
                      userId: auth.userProfile!.uid,
                      userEmail: auth.userProfile!.email,
                      tableNumber: _tableCtrl.text.trim(),
                      notes: _notesCtrl.text.trim(),
                      paymentMethod: _paymentMethod,
                    );
                    if (mounted) {
                      context.go('/order-success/$orderId');
                    }
                  } catch (e) {
                    Fluttertoast.showToast(
                      msg: 'Gagal membuat pesanan. Coba lagi.',
                      backgroundColor: Colors.redAccent,
                    );
                  } finally {
                    if (mounted) setState(() => _isLoading = false);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentMethodCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool selected;
  final VoidCallback onTap;

  const _PaymentMethodCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: selected
                ? const Color(0xFFC8A96E).withOpacity(0.15)
                : const Color(0xFF2A2A2A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected
                  ? const Color(0xFFC8A96E)
                  : const Color(0xFF3A3A3A),
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon,
                  color: selected
                      ? const Color(0xFFC8A96E)
                      : Colors.white54),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  color: selected
                      ? const Color(0xFFC8A96E)
                      : Colors.white70,
                  fontWeight: selected
                      ? FontWeight.bold
                      : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
