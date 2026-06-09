import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _loginFormKey = GlobalKey<FormState>();
  final _registerFormKey = GlobalKey<FormState>();

  // Login fields
  final _loginEmailCtrl = TextEditingController();
  final _loginPasswordCtrl = TextEditingController();

  // Register fields
  final _regNameCtrl = TextEditingController();
  final _regEmailCtrl = TextEditingController();
  final _regPhoneCtrl = TextEditingController();
  final _regPasswordCtrl = TextEditingController();
  final _regConfirmCtrl = TextEditingController();

  bool _loginObscure = true;
  bool _regObscure = true;
  bool _regConfirmObscure = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailCtrl.dispose();
    _loginPasswordCtrl.dispose();
    _regNameCtrl.dispose();
    _regEmailCtrl.dispose();
    _regPhoneCtrl.dispose();
    _regPasswordCtrl.dispose();
    _regConfirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A1A),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 40),
                // Logo
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFFC8A96E),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.local_cafe,
                    size: 40,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'ICafe',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFC8A96E),
                    letterSpacing: 2,
                  ),
                ),
                const Text(
                  'Selamat datang kembali',
                  style: TextStyle(color: Colors.white60, fontSize: 14),
                ),
                const SizedBox(height: 40),

                // Tab bar
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2A2A),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    indicator: BoxDecoration(
                      color: const Color(0xFFC8A96E),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white60,
                    tabs: const [
                      Tab(text: 'Masuk'),
                      Tab(text: 'Daftar'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  height: 480,
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildLoginForm(),
                      _buildRegisterForm(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return Form(
          key: _loginFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AppTextField(
                controller: _loginEmailCtrl,
                label: 'Email',
                hintText: 'nama@email.com',
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Email wajib diisi';
                  if (!v.contains('@')) return 'Format email tidak valid';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: _loginPasswordCtrl,
                label: 'Password',
                hintText: '••••••••',
                obscureText: _loginObscure,
                prefixIcon: Icons.lock_outlined,
                suffixIcon: IconButton(
                  icon: Icon(
                    _loginObscure ? Icons.visibility : Icons.visibility_off,
                    color: Colors.white60,
                  ),
                  onPressed: () =>
                      setState(() => _loginObscure = !_loginObscure),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Password wajib diisi';
                  return null;
                },
              ),
              if (auth.errorMessage != null && auth.status == AuthStatus.error)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    auth.errorMessage!,
                    style: const TextStyle(color: Colors.redAccent),
                    textAlign: TextAlign.center,
                  ),
                ),
              const SizedBox(height: 24),
              AppButton(
                label: 'Masuk',
                isLoading: auth.status == AuthStatus.loading,
                onPressed: () async {
                  if (!_loginFormKey.currentState!.validate()) return;
                  final ok = await auth.signInWithEmail(
                    email: _loginEmailCtrl.text.trim(),
                    password: _loginPasswordCtrl.text,
                  );
                  if (ok && mounted) context.go('/');
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: const [
                  Expanded(child: Divider(color: Colors.white24)),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('atau', style: TextStyle(color: Colors.white60)),
                  ),
                  Expanded(child: Divider(color: Colors.white24)),
                ],
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: auth.status == AuthStatus.loading
                    ? null
                    : () async {
                        final ok = await auth.signInWithGoogle();
                        if (ok && mounted) context.go('/');
                      },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white24),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(Icons.g_mobiledata,
                    color: Colors.white, size: 24),
                label: const Text(
                  'Masuk dengan Google',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRegisterForm() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return Form(
          key: _registerFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AppTextField(
                controller: _regNameCtrl,
                label: 'Nama Lengkap',
                hintText: 'John Doe',
                prefixIcon: Icons.person_outlined,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Nama wajib diisi';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _regEmailCtrl,
                label: 'Email',
                hintText: 'nama@email.com',
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Email wajib diisi';
                  if (!v.contains('@')) return 'Format email tidak valid';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _regPhoneCtrl,
                label: 'No. Telepon (opsional)',
                hintText: '08xxxxxxxxxx',
                keyboardType: TextInputType.phone,
                prefixIcon: Icons.phone_outlined,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _regPasswordCtrl,
                label: 'Password',
                hintText: 'min. 6 karakter',
                obscureText: _regObscure,
                prefixIcon: Icons.lock_outlined,
                suffixIcon: IconButton(
                  icon: Icon(
                    _regObscure ? Icons.visibility : Icons.visibility_off,
                    color: Colors.white60,
                  ),
                  onPressed: () => setState(() => _regObscure = !_regObscure),
                ),
                validator: (v) {
                  if (v == null || v.length < 6)
                    return 'Password minimal 6 karakter';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _regConfirmCtrl,
                label: 'Konfirmasi Password',
                hintText: '••••••••',
                obscureText: _regConfirmObscure,
                prefixIcon: Icons.lock_outlined,
                suffixIcon: IconButton(
                  icon: Icon(
                    _regConfirmObscure
                        ? Icons.visibility
                        : Icons.visibility_off,
                    color: Colors.white60,
                  ),
                  onPressed: () =>
                      setState(() => _regConfirmObscure = !_regConfirmObscure),
                ),
                validator: (v) {
                  if (v != _regPasswordCtrl.text)
                    return 'Password tidak cocok';
                  return null;
                },
              ),
              if (auth.errorMessage != null && auth.status == AuthStatus.error)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    auth.errorMessage!,
                    style: const TextStyle(color: Colors.redAccent),
                    textAlign: TextAlign.center,
                  ),
                ),
              const SizedBox(height: 16),
              AppButton(
                label: 'Daftar',
                isLoading: auth.status == AuthStatus.loading,
                onPressed: () async {
                  if (!_registerFormKey.currentState!.validate()) return;
                  final ok = await auth.registerWithEmail(
                    email: _regEmailCtrl.text.trim(),
                    password: _regPasswordCtrl.text,
                    displayName: _regNameCtrl.text.trim(),
                    phone: _regPhoneCtrl.text.trim().isEmpty
                        ? null
                        : _regPhoneCtrl.text.trim(),
                  );
                  if (ok && mounted) context.go('/');
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
