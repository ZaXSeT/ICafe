import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../services/reservation_service.dart';
import '../models/reservation.dart';
import '../widgets/app_button.dart';
import '../widgets/app_text_field.dart';

class ReservationsScreen extends StatefulWidget {
  const ReservationsScreen({super.key});

  @override
  State<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends State<ReservationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        leading: context.canPop()
            ? IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => context.pop(),
              )
            : null,
        title: const Text('Reservasi',
            style: TextStyle(color: Colors.white)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFC8A96E),
          labelColor: const Color(0xFFC8A96E),
          unselectedLabelColor: Colors.white54,
          tabs: const [
            Tab(text: 'Buat Reservasi'),
            Tab(text: 'Riwayat'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _CreateReservationTab(),
          _ReservationHistoryTab(),
        ],
      ),
    );
  }
}

// ─── CREATE RESERVATION TAB
class _CreateReservationTab extends StatefulWidget {
  const _CreateReservationTab();

  @override
  State<_CreateReservationTab> createState() =>
      _CreateReservationTabState();
}

class _CreateReservationTabState extends State<_CreateReservationTab> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _specialCtrl = TextEditingController();
  final ReservationService _service = ReservationService();

  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedTime;
  int _guestCount = 2;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _specialCtrl.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFC8A96E),
            surface: Color(0xFF2A2A2A),
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final times = _service.getAvailableTimeSlots();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppTextField(
              controller: _nameCtrl,
              label: 'Nama',
              hintText: 'Nama pemesan',
              prefixIcon: Icons.person_outlined,
              validator: (v) =>
                  v!.isEmpty ? 'Nama wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            AppTextField(
              controller: _phoneCtrl,
              label: 'No. Telepon',
              hintText: '08xxxxxxxxxx',
              keyboardType: TextInputType.phone,
              prefixIcon: Icons.phone_outlined,
              validator: (v) =>
                  v!.isEmpty ? 'No. telepon wajib diisi' : null,
            ),
            const SizedBox(height: 16),

            // Date picker
            const Text('Tanggal',
                style:
                    TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 6),
            GestureDetector(
              onTap: _selectDate,
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF2A2A2A),
                  borderRadius: BorderRadius.circular(12),
                  border:
                      Border.all(color: const Color(0xFF3A3A3A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        color: Colors.white54, size: 20),
                    const SizedBox(width: 12),
                    Text(
                      DateFormat('EEEE, d MMMM yyyy', 'id_ID')
                          .format(_selectedDate),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Time picker
            const Text('Jam',
                style:
                    TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: times.map((t) {
                final sel = _selectedTime == t;
                return GestureDetector(
                  onTap: () => setState(() => _selectedTime = t),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: sel
                          ? const Color(0xFFC8A96E)
                          : const Color(0xFF2A2A2A),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: sel
                            ? const Color(0xFFC8A96E)
                            : const Color(0xFF3A3A3A),
                      ),
                    ),
                    child: Text(
                      t,
                      style: TextStyle(
                        color: sel ? Colors.white : Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),

            // Guest count
            const Text('Jumlah Tamu',
                style:
                    TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 6),
            Row(
              children: [
                IconButton(
                  onPressed: () {
                    if (_guestCount > 1)
                      setState(() => _guestCount--);
                  },
                  icon: const Icon(Icons.remove_circle_outline,
                      color: Colors.white54),
                ),
                Text(
                  '$_guestCount orang',
                  style: const TextStyle(
                      color: Colors.white, fontSize: 16),
                ),
                IconButton(
                  onPressed: () {
                    if (_guestCount < 20)
                      setState(() => _guestCount++);
                  },
                  icon: const Icon(Icons.add_circle_outline,
                      color: Color(0xFFC8A96E)),
                ),
              ],
            ),

            const SizedBox(height: 16),

            AppTextField(
              controller: _specialCtrl,
              label: 'Permintaan Khusus (opsional)',
              hintText: 'Contoh: Kursi dekat jendela',
              prefixIcon: Icons.note_outlined,
              maxLines: 2,
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: AppButton(
                label: 'Buat Reservasi',
                isLoading: _isLoading,
                onPressed: () async {
                  if (!_formKey.currentState!.validate()) return;
                  if (_selectedTime == null) {
                    Fluttertoast.showToast(
                        msg: 'Pilih jam reservasi');
                    return;
                  }
                  if (auth.userProfile == null) {
                    context.push('/login');
                    return;
                  }
                  setState(() => _isLoading = true);
                  try {
                    await _service.createReservation(
                      userId: auth.userProfile!.uid,
                      userName: _nameCtrl.text.trim(),
                      userEmail: auth.userProfile!.email,
                      userPhone: _phoneCtrl.text.trim(),
                      date: _selectedDate,
                      time: _selectedTime!,
                      guestCount: _guestCount,
                      specialRequest: _specialCtrl.text.trim(),
                    );
                    Fluttertoast.showToast(
                      msg: 'Reservasi berhasil dibuat!',
                      backgroundColor: Colors.green,
                    );
                    _nameCtrl.clear();
                    _phoneCtrl.clear();
                    _specialCtrl.clear();
                    setState(() => _selectedTime = null);
                  } catch (e) {
                    Fluttertoast.showToast(
                      msg: 'Gagal membuat reservasi.',
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

// ─── RESERVATION HISTORY TAB
class _ReservationHistoryTab extends StatelessWidget {
  const _ReservationHistoryTab();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (auth.userProfile == null) {
      return const Center(
        child: Text('Login untuk melihat reservasi',
            style: TextStyle(color: Colors.white54)),
      );
    }

    final service = ReservationService();
    return StreamBuilder<List<Reservation>>(
      stream: service.userReservationsStream(auth.userProfile!.uid),
      builder: (ctx, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(
              child: CircularProgressIndicator(
                  color: Color(0xFFC8A96E)));
        }
        final items = snap.data ?? [];
        if (items.isEmpty) {
          return const Center(
            child: Text('Belum ada reservasi',
                style: TextStyle(color: Colors.white54)),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (_, i) => _ReservationCard(reservation: items[i]),
        );
      },
    );
  }
}

class _ReservationCard extends StatelessWidget {
  final Reservation reservation;
  const _ReservationCard({required this.reservation});

  Color _statusColor() {
    switch (reservation.status) {
      case ReservationStatus.confirmed:
        return Colors.green;
      case ReservationStatus.cancelled:
        return Colors.redAccent;
      case ReservationStatus.completed:
        return Colors.blue;
      default:
        return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: _statusColor().withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                DateFormat('d MMM yyyy').format(reservation.date),
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _statusColor().withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  reservation.statusLabel,
                  style: TextStyle(
                      color: _statusColor(), fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('Jam: ${reservation.time}',
              style: const TextStyle(color: Colors.white70)),
          Text('Tamu: ${reservation.guestCount} orang',
              style: const TextStyle(color: Colors.white70)),
          if (reservation.specialRequest != null)
            Text('Catatan: ${reservation.specialRequest}',
                style: const TextStyle(color: Colors.white54, fontSize: 12)),
          if (reservation.status == ReservationStatus.pending) ...
            [
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () async {
                    await ReservationService()
                        .cancelReservation(reservation.id);
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.redAccent),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Batalkan',
                      style: TextStyle(color: Colors.redAccent)),
                ),
              ),
            ],
        ],
      ),
    );
  }
}
