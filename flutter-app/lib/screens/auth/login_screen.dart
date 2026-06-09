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

enum _AuthMode { landing, login, register }

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  _AuthMode _mode = _AuthMode.landing;

  // Login fields
  final _loginFormKey = GlobalKey<FormState>();
  final _loginEmailCtrl = TextEditingController();
  final _loginPasswordCtrl = TextEditingController();
  bool _loginObscure = true;

  // Register fields
  final _registerFormKey = GlobalKey<FormState>();
  final _regNameCtrl = TextEditingController();
  final _regEmailCtrl = TextEditingController();
  final _regPhoneCtrl = TextEditingController();
  final _regPasswordCtrl = TextEditingController();
  final _regConfirmCtrl = TextEditingController();
  bool _regObscure = true;
  bool _regConfirmObscure = true;

  @override
  void dispose() {
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
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: _mode == _AuthMode.landing
              ? _buildLanding()
              : _mode == _AuthMode.login
                  ? _buildLoginForm()
                  : _buildRegisterForm(),
        ),
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  // LANDING SCREEN
  Widget _buildLanding() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return Padding(
          key: const ValueKey('landing'),
          padding: const EdgeInsets.symmetric(horizontal: 28.0),
          child: Column(
            children: [
              const Spacer(flex: 2),

              // Logo
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: const Color(0xFFC8A96E),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFC8A96E).withOpacity(0.4),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.local_cafe,
                  size: 44,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'ICafe',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFC8A96E),
                  letterSpacing: 3,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Pesan kopi favoritmu kapan saja',
                style: TextStyle(color: Colors.white54, fontSize: 14),
                textAlign: TextAlign.center,
              ),

              const Spacer(flex: 3),

              // Continue with Google
              _GoogleSignInButton(
                isLoading: auth.status == AuthStatus.loading,
                onPressed: () async {
                  final ok = await auth.signInWithGoogle();
                  if (ok && mounted) context.go('/');
                },
              ),

              const SizedBox(height: 16),

              // Create Account
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => setState(() => _mode = _AuthMode.register),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC8A96E),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Buat Akun',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 14),

              // Sign in with email
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => setState(() => _mode = _AuthMode.login),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: Color(0xFF3A3A3A)),
                    ),
                  ),
                  child: const Text(
                    'Masuk dengan Email',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),

              if (auth.errorMessage != null &&
                  auth.status == AuthStatus.error)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    auth.errorMessage!,
                    style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ),

              const SizedBox(height: 32),

              // Terms
              Text(
                'Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan
dan Kebijakan Privasi ICafe.',
                style: TextStyle(
                    color: Colors.white.withOpacity(0.3),
                    fontSize: 11,
                    height: 1.6),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  // ────────────────────────────────────────────────────────────
  // LOGIN FORM
  Widget _buildLoginForm() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return SingleChildScrollView(
          key: const ValueKey('login'),
          padding: const EdgeInsets.symmetric(horizontal: 28.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              // Back
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white70),
                onPressed: () =>
                    setState(() => _mode = _AuthMode.landing),
                padding: EdgeInsets.zero,
              ),
              const SizedBox(height: 24),

              const Text(
                'Masuk',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Selamat datang kembali ☕',
                style: TextStyle(color: Colors.white54, fontSize: 14),
              ),
              const SizedBox(height: 32),

              Form(
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
                        if (v == null || v.isEmpty)
                          return 'Email wajib diisi';
                        if (!v.contains('@'))
                          return 'Format email tidak valid';
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
                          _loginObscure
                              ? Icons.visibility
                              : Icons.visibility_off,
                          color: Colors.white60,
                          size: 20,
                        ),
                        onPressed: () => setState(
                            () => _loginObscure = !_loginObscure),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty)
                          return 'Password wajib diisi';
                        return null;
                      },
                    ),
                    if (auth.errorMessage != null &&
                        auth.status == AuthStatus.error)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(
                          auth.errorMessage!,
                          style: const TextStyle(
                              color: Colors.redAccent, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    const SizedBox(height: 28),
                    AppButton(
                      label: 'Masuk',
                      isLoading: auth.status == AuthStatus.loading,
                      onPressed: () async {
                        if (!_loginFormKey.currentState!.validate())
                          return;
                        final ok = await auth.signInWithEmail(
                          email: _loginEmailCtrl.text.trim(),
                          password: _loginPasswordCtrl.text,
                        );
                        if (ok && mounted) context.go('/');
                      },
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: const [
                        Expanded(
                            child: Divider(color: Colors.white24)),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Text('atau',
                              style: TextStyle(color: Colors.white54)),
                        ),
                        Expanded(
                            child: Divider(color: Colors.white24)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    _GoogleSignInButton(
                      isLoading: auth.status == AuthStatus.loading,
                      onPressed: () async {
                        final ok = await auth.signInWithGoogle();
                        if (ok && mounted) context.go('/');
                      },
                    ),
                    const SizedBox(height: 20),
                    Center(
                      child: TextButton(
                        onPressed: () => setState(
                            () => _mode = _AuthMode.register),
                        child: const Text.rich(
                          TextSpan(
                            text: 'Belum punya akun? ',
                            style: TextStyle(color: Colors.white54),
                            children: [
                              TextSpan(
                                text: 'Daftar',
                                style: TextStyle(
                                    color: Color(0xFFC8A96E),
                                    fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ────────────────────────────────────────────────────────────
  // REGISTER FORM
  Widget _buildRegisterForm() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return SingleChildScrollView(
          key: const ValueKey('register'),
          padding: const EdgeInsets.symmetric(horizontal: 28.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white70),
                onPressed: () =>
                    setState(() => _mode = _AuthMode.landing),
                padding: EdgeInsets.zero,
              ),
              const SizedBox(height: 24),

              const Text(
                'Buat Akun',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Daftar untuk mulai memesan',
                style: TextStyle(color: Colors.white54, fontSize: 14),
              ),
              const SizedBox(height: 32),

              Form(
                key: _registerFormKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppTextField(
                      controller: _regNameCtrl,
                      label: 'Nama Lengkap',
                      hintText: 'John Doe',
                      prefixIcon: Icons.person_outlined,
                      validator: (v) =>
                          v!.isEmpty ? 'Nama wajib diisi' : null,
                    ),
                    const SizedBox(height: 14),
                    AppTextField(
                      controller: _regEmailCtrl,
                      label: 'Email',
                      hintText: 'nama@email.com',
                      keyboardType: TextInputType.emailAddress,
                      prefixIcon: Icons.email_outlined,
                      validator: (v) {
                        if (v == null || v.isEmpty)
                          return 'Email wajib diisi';
                        if (!v.contains('@'))
                          return 'Format email tidak valid';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    AppTextField(
                      controller: _regPhoneCtrl,
                      label: 'No. Telepon (opsional)',
                      hintText: '08xxxxxxxxxx',
                      keyboardType: TextInputType.phone,
                      prefixIcon: Icons.phone_outlined,
                    ),
                    const SizedBox(height: 14),
                    AppTextField(
                      controller: _regPasswordCtrl,
                      label: 'Password',
                      hintText: 'min. 6 karakter',
                      obscureText: _regObscure,
                      prefixIcon: Icons.lock_outlined,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _regObscure
                              ? Icons.visibility
                              : Icons.visibility_off,
                          color: Colors.white60,
                          size: 20,
                        ),
                        onPressed: () =>
                            setState(() => _regObscure = !_regObscure),
                      ),
                      validator: (v) {
                        if (v == null || v.length < 6)
                          return 'Password minimal 6 karakter';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
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
                          size: 20,
                        ),
                        onPressed: () => setState(() =>
                            _regConfirmObscure = !_regConfirmObscure),
                      ),
                      validator: (v) {
                        if (v != _regPasswordCtrl.text)
                          return 'Password tidak cocok';
                        return null;
                      },
                    ),
                    if (auth.errorMessage != null &&
                        auth.status == AuthStatus.error)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(
                          auth.errorMessage!,
                          style: const TextStyle(
                              color: Colors.redAccent, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    const SizedBox(height: 28),
                    AppButton(
                      label: 'Buat Akun',
                      isLoading: auth.status == AuthStatus.loading,
                      onPressed: () async {
                        if (!_registerFormKey.currentState!.validate())
                          return;
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
                    const SizedBox(height: 20),
                    Row(
                      children: const [
                        Expanded(
                            child: Divider(color: Colors.white24)),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Text('atau',
                              style: TextStyle(color: Colors.white54)),
                        ),
                        Expanded(
                            child: Divider(color: Colors.white24)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    _GoogleSignInButton(
                      isLoading: auth.status == AuthStatus.loading,
                      onPressed: () async {
                        final ok = await auth.signInWithGoogle();
                        if (ok && mounted) context.go('/');
                      },
                    ),
                    const SizedBox(height: 20),
                    Center(
                      child: TextButton(
                        onPressed: () =>
                            setState(() => _mode = _AuthMode.login),
                        child: const Text.rich(
                          TextSpan(
                            text: 'Sudah punya akun? ',
                            style: TextStyle(color: Colors.white54),
                            children: [
                              TextSpan(
                                text: 'Masuk',
                                style: TextStyle(
                                    color: Color(0xFFC8A96E),
                                    fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ─── Google Sign-In Button Widget
class _GoogleSignInButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;

  const _GoogleSignInButton({
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          side: const BorderSide(color: Color(0xFF3A3A3A), width: 1.5),
          backgroundColor: const Color(0xFF2A2A2A),
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Google logo SVG-style icon
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Center(
                      child: Text(
                        'G',
                        style: TextStyle(
                          color: Color(0xFF4285F4),
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Lanjutkan dengan Google',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
