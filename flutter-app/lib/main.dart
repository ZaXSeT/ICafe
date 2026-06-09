import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const ICafeApp());
}

class ICafeApp extends StatelessWidget {
  const ICafeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: Builder(
        builder: (context) {
          final authProvider = context.watch<AuthProvider>();
          final router = createRouter(authProvider);

          return MaterialApp.router(
            title: 'ICafe',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              colorScheme: ColorScheme.dark(
                primary: const Color(0xFFC8A96E),
                secondary: const Color(0xFFC8A96E),
                surface: const Color(0xFF2A2A2A),
                background: const Color(0xFF1A1A1A),
                onPrimary: Colors.white,
                onSecondary: Colors.white,
                onSurface: Colors.white,
              ),
              scaffoldBackgroundColor: const Color(0xFF1A1A1A),
              appBarTheme: const AppBarTheme(
                backgroundColor: Color(0xFF1A1A1A),
                foregroundColor: Colors.white,
                elevation: 0,
                iconTheme: IconThemeData(color: Colors.white),
                titleTextStyle: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              bottomNavigationBarTheme: const BottomNavigationBarThemeData(
                backgroundColor: Color(0xFF222222),
                selectedItemColor: Color(0xFFC8A96E),
                unselectedItemColor: Colors.white38,
                elevation: 0,
              ),
              tabBarTheme: const TabBarThemeData(
                labelColor: Color(0xFFC8A96E),
                unselectedLabelColor: Colors.white54,
                indicatorColor: Color(0xFFC8A96E),
              ),
              inputDecorationTheme: InputDecorationTheme(
                filled: true,
                fillColor: const Color(0xFF2A2A2A),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF3A3A3A)),
                ),
              ),
              useMaterial3: true,
              fontFamily: 'Roboto',
            ),
            routerConfig: router,
          );
        },
      ),
    );
  }
}
