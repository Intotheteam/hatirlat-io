import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  bool _hasNavigated = false;

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authProvider, (prev, next) {
      if (_hasNavigated) return;
      if (next is AuthAuthenticated) {
        _hasNavigated = true;
        context.go('/');
      } else if (next is AuthUnauthenticated) {
        _hasNavigated = true;
        context.go('/onboarding');
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      body: Container(
        // Ekranı tamamen kaplaması için
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.white,
              Color(0xFFF1F5F9), // Slate 100
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo container - Pastel stilinde yuvarlak
              Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: AppColors.lightBlue,
                  shape: BoxShape.circle, // Tam yuvarlak
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.lightBlue.withOpacity(0.2),
                      blurRadius: 30,
                      spreadRadius: 10,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.notifications_rounded,
                  color: Colors.white,
                  size: 64,
                ),
              )
                  .animate()
                  .scale(duration: 800.ms, curve: Curves.elasticOut)
                  .fadeIn(duration: 400.ms),

              const SizedBox(height: 40),

              // Marka / Metin Alanı
              const Text(
                'Hatırlat IO',
                style: TextStyle(
                  color: Color(0xFF0F172A), // Koyu okunabilir metin
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.5,
                ),
              )
                  .animate()
                  .fadeIn(delay: 300.ms, duration: 400.ms)
                  .slideY(begin: 0.3, end: 0, delay: 300.ms, duration: 400.ms),

              const SizedBox(height: 12),

              // Slogan veya Alt Metin
              const Text(
                'Planla. Hatırla. Yaşa.',
                style: TextStyle(
                  color: Color(0xFF64748B), // Orta gri
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.3,
                ),
              ).animate().fadeIn(delay: 500.ms, duration: 400.ms),

              const SizedBox(height: 60),

              SizedBox(
                width: 32,
                height: 32,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    AppColors.lightBlue,
                  ),
                ),
              ).animate().fadeIn(delay: 700.ms, duration: 300.ms),
            ],
          ),
        ),
      ),
    );
  }
}
