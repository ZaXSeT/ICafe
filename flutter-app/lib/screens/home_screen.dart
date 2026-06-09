import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../services/menu_service.dart';
import '../models/menu_item.dart';
import '../widgets/menu_item_card.dart';
import 'package:badges/badges.dart' as badges;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final MenuService _menuService = MenuService();
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      body: IndexedStack(
        index: _selectedIndex,
        children: const [
          _HomeTab(),
          _MenuTab(),
          _OrdersTab(),
          _ReservationsTab(),
          _ProfileTab(),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Consumer<CartProvider>(
      builder: (context, cart, _) {
        return Container(
          decoration: const BoxDecoration(
            color: Color(0xFF222222),
            border: Border(
              top: BorderSide(color: Color(0xFF333333), width: 1),
            ),
          ),
          child: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: (i) => setState(() => _selectedIndex = i),
            backgroundColor: Colors.transparent,
            selectedItemColor: const Color(0xFFC8A96E),
            unselectedItemColor: Colors.white38,
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: 'Beranda',
              ),
              BottomNavigationBarItem(
                icon: badges.Badge(
                  showBadge: cart.itemCount > 0,
                  badgeContent: Text(
                    '${cart.itemCount}',
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                  badgeStyle: const badges.BadgeStyle(
                    badgeColor: Color(0xFFC8A96E),
                  ),
                  child: const Icon(Icons.restaurant_menu_outlined),
                ),
                activeIcon: const Icon(Icons.restaurant_menu),
                label: 'Menu',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.receipt_long_outlined),
                activeIcon: Icon(Icons.receipt_long),
                label: 'Pesanan',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.table_restaurant_outlined),
                activeIcon: Icon(Icons.table_restaurant),
                label: 'Reservasi',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.person_outlined),
                activeIcon: Icon(Icons.person),
                label: 'Profil',
              ),
            ],
          ),
        );
      },
    );
  }
}

// ─── HOME TAB ───────────────────────────────────────────────────────────────
class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final name = auth.userProfile?.displayName ?? 'Pelanggan';
    final MenuService menuService = MenuService();

    return CustomScrollView(
      slivers: [
        // App bar
        SliverAppBar(
          backgroundColor: const Color(0xFF1A1A1A),
          floating: true,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'ICafe',
                style: TextStyle(
                  color: Color(0xFFC8A96E),
                  fontWeight: FontWeight.bold,
                  fontSize: 22,
                ),
              ),
              Text(
                'Halo, $name! ☕',
                style: const TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ],
          ),
          actions: [
            Consumer<CartProvider>(
              builder: (ctx, cart, _) => badges.Badge(
                showBadge: cart.itemCount > 0,
                badgeContent: Text(
                  '${cart.itemCount}',
                  style: const TextStyle(color: Colors.white, fontSize: 10),
                ),
                badgeStyle: const badges.BadgeStyle(
                  badgeColor: Color(0xFFC8A96E),
                ),
                child: IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined,
                      color: Colors.white),
                  onPressed: () => context.push('/cart'),
                ),
              ),
            ),
          ],
        ),

        // Hero banner
        SliverToBoxAdapter(
          child: Container(
            margin: const EdgeInsets.all(16),
            height: 160,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: const LinearGradient(
                colors: [Color(0xFF8B6914), Color(0xFFC8A96E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Stack(
              children: [
                Positioned(
                  right: 16,
                  top: 16,
                  child: Icon(
                    Icons.local_cafe,
                    size: 80,
                    color: Colors.white.withOpacity(0.2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Selamat Datang di ICafe',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Nikmati kopi terbaik kami',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF8B6914),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text(
                          'Pesan Sekarang',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Section: Featured Menu
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: Text(
              'Menu Unggulan',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),

        SliverToBoxAdapter(
          child: SizedBox(
            height: 220,
            child: StreamBuilder<List<MenuItem>>(
              stream: menuService.featuredMenu(),
              builder: (ctx, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFC8A96E),
                    ),
                  );
                }
                final items = snap.data ?? [];
                if (items.isEmpty) {
                  return const Center(
                    child: Text('Belum ada menu',
                        style: TextStyle(color: Colors.white54)),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: items.length,
                  itemBuilder: (ctx, i) => SizedBox(
                    width: 180,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: MenuItemCard(item: items[i]),
                    ),
                  ),
                );
              },
            ),
          ),
        ),

        // Quick Actions
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Layanan',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _QuickActionCard(
                      icon: Icons.table_restaurant,
                      label: 'Reservasi Meja',
                      color: const Color(0xFF2A5298),
                      onTap: () {},
                    ),
                    const SizedBox(width: 12),
                    _QuickActionCard(
                      icon: Icons.receipt_long,
                      label: 'Pesanan Saya',
                      color: const Color(0xFF1B5E20),
                      onTap: () {},
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 16)),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.color,
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
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── MENU TAB ────────────────────────────────────────────────────────────────
class _MenuTab extends StatefulWidget {
  const _MenuTab();

  @override
  State<_MenuTab> createState() => _MenuTabState();
}

class _MenuTabState extends State<_MenuTab> {
  final MenuService _menuService = MenuService();
  String _selectedCategory = 'Semua';
  String _searchQuery = '';
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Text('Menu', style: TextStyle(color: Colors.white)),
        actions: [
          Consumer<CartProvider>(
            builder: (ctx, cart, _) => cart.isEmpty
                ? const SizedBox()
                : Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: TextButton.icon(
                      onPressed: () => context.push('/cart'),
                      icon: const Icon(Icons.shopping_cart,
                          color: Color(0xFFC8A96E), size: 20),
                      label: Text(
                        '${cart.itemCount} item',
                        style: const TextStyle(color: Color(0xFFC8A96E)),
                      ),
                    ),
                  ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: TextField(
              controller: _searchCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Cari menu...',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon:
                    const Icon(Icons.search, color: Colors.white54),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon:
                            const Icon(Icons.clear, color: Colors.white54),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFF2A2A2A),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (v) => setState(() => _searchQuery = v),
            ),
          ),

          // Category chips
          FutureBuilder<List<String>>(
            future: _menuService.getCategories(),
            builder: (ctx, snap) {
              final cats = ['Semua', ...(snap.data ?? [])];
              return SizedBox(
                height: 40,
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  scrollDirection: Axis.horizontal,
                  itemCount: cats.length,
                  itemBuilder: (_, i) {
                    final cat = cats[i];
                    final selected = _selectedCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: FilterChip(
                        label: Text(cat),
                        selected: selected,
                        onSelected: (_) =>
                            setState(() => _selectedCategory = cat),
                        backgroundColor: const Color(0xFF2A2A2A),
                        selectedColor:
                            const Color(0xFFC8A96E).withOpacity(0.3),
                        labelStyle: TextStyle(
                          color: selected
                              ? const Color(0xFFC8A96E)
                              : Colors.white70,
                          fontWeight: selected
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                        side: BorderSide(
                          color: selected
                              ? const Color(0xFFC8A96E)
                              : Colors.transparent,
                        ),
                        showCheckmark: false,
                      ),
                    );
                  },
                ),
              );
            },
          ),

          const SizedBox(height: 8),

          // Menu grid
          Expanded(
            child: StreamBuilder<List<MenuItem>>(
              stream: _selectedCategory == 'Semua'
                  ? _menuService.menuStream()
                  : _menuService.menuByCategory(_selectedCategory),
              builder: (ctx, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(
                        color: Color(0xFFC8A96E)),
                  );
                }
                var items = snap.data ?? [];
                if (_searchQuery.isNotEmpty) {
                  final q = _searchQuery.toLowerCase();
                  items = items
                      .where((i) =>
                          i.name.toLowerCase().contains(q) ||
                          i.description.toLowerCase().contains(q))
                      .toList();
                }
                if (items.isEmpty) {
                  return const Center(
                    child: Text(
                      'Menu tidak ditemukan',
                      style: TextStyle(color: Colors.white54),
                    ),
                  );
                }
                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.75,
                  ),
                  itemCount: items.length,
                  itemBuilder: (_, i) => MenuItemCard(item: items[i]),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: Consumer<CartProvider>(
        builder: (ctx, cart, _) => cart.isEmpty
            ? const SizedBox()
            : FloatingActionButton.extended(
                onPressed: () => context.push('/cart'),
                backgroundColor: const Color(0xFFC8A96E),
                icon: const Icon(Icons.shopping_cart, color: Colors.white),
                label: Text(
                  '${cart.itemCount} • Rp ${_formatPrice(cart.total)}',
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
      ),
    );
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
  }
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
class _OrdersTab extends StatelessWidget {
  const _OrdersTab();

  @override
  Widget build(BuildContext context) => const Center(
        child: Text('Pesanan Saya', style: TextStyle(color: Colors.white)),
      );
}

// ─── RESERVATIONS TAB ────────────────────────────────────────────────────────
class _ReservationsTab extends StatelessWidget {
  const _ReservationsTab();

  @override
  Widget build(BuildContext context) => const Center(
        child:
            Text('Reservasi', style: TextStyle(color: Colors.white)),
      );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
class _ProfileTab extends StatelessWidget {
  const _ProfileTab();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final profile = auth.userProfile;

    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        title:
            const Text('Profil', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            onPressed: () async {
              await auth.signOut();
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar
            CircleAvatar(
              radius: 50,
              backgroundColor: const Color(0xFFC8A96E),
              backgroundImage: profile?.photoUrl != null
                  ? NetworkImage(profile!.photoUrl!)
                  : null,
              child: profile?.photoUrl == null
                  ? Text(
                      profile?.displayName.substring(0, 1).toUpperCase() ??
                          'U',
                      style: const TextStyle(
                          fontSize: 36,
                          color: Colors.white,
                          fontWeight: FontWeight.bold),
                    )
                  : null,
            ),
            const SizedBox(height: 16),
            Text(
              profile?.displayName ?? '',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              profile?.email ?? '',
              style: const TextStyle(color: Colors.white60, fontSize: 14),
            ),
            const SizedBox(height: 32),
            _ProfileMenuItem(
              icon: Icons.person_outlined,
              label: 'Edit Profil',
              onTap: () => context.push('/profile/edit'),
            ),
            _ProfileMenuItem(
              icon: Icons.receipt_long_outlined,
              label: 'Riwayat Pesanan',
              onTap: () => context.push('/orders'),
            ),
            _ProfileMenuItem(
              icon: Icons.table_restaurant_outlined,
              label: 'Reservasi Saya',
              onTap: () => context.push('/reservations'),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => auth.signOut(),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(Icons.logout, color: Colors.redAccent),
                label: const Text('Keluar',
                    style: TextStyle(color: Colors.redAccent)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: const Color(0xFFC8A96E)),
      title: Text(label, style: const TextStyle(color: Colors.white)),
      trailing: const Icon(Icons.chevron_right, color: Colors.white54),
      contentPadding: EdgeInsets.zero,
    );
  }
}
